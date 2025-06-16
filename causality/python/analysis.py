from textblob import TextBlob
from scraper import search_reddit

def analyze_sentiment(text_list):
    polarity_list = []
    for text in text_list:    
        analysis = TextBlob(text)
        polarity_list.append(analysis.sentiment.polarity)

    return polarity_list
    
print(search_reddit("S&P 500"))
print(analyze_sentiment(search_reddit("S&P 500")))