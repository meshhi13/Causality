import praw
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
user_agent = os.getenv("USER_AGENT")

reddit = praw.Reddit(
    client_id=client_id,
    client_secret=client_secret,
    user_agent=user_agent
)

query = "climate change" 
subreddit = reddit.subreddit("all") 
results = subreddit.search(query, limit=5)

for post in results:
    print(f"\nTitle: {post.title}\nURL: {post.url}\n")
    post.comments.replace_more(limit=0) 
    for comment in post.comments[:5]:
        if comment.author == "AutoModerator":
            continue
        if comment.body == "[deleted]":
            continue
        print(f"- {comment.body[:100]}...")
