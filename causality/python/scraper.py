import praw
import os
from dotenv import load_dotenv

load_dotenv()

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
user_agent = os.getenv("USER_AGENT")

reddit = praw.Reddit(
    client_id=client_id,
    client_secret=client_secret,
    user_agent=user_agent
)

def search_reddit(query):
    subreddit = reddit.subreddit("all") 
    results = subreddit.search(query, limit=10, sort="relevance", time_filter="week")
    returnList = []

    for post in results:
        returnString = ""
        returnString += f"\nTitle: {post.title}"
        post.comments.replace_more(limit=0) 
        returnString += f"\nBody: {post.selftext}..."
        returnList.append(returnString)
        for comment in post.comments[:5]:
            if comment.author == "AutoModerator":
                continue
            if comment.body == "[deleted]" or comment.body == "[removed]":
                continue
            returnString += f"\nComment: {comment.body}..."
        
        returnList.append(returnString)
    
    return returnList