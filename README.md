# Causality

**Causality** is a web-based stock trading simulation app built using **Next.js**, **Firebase**, and the **Finnhub API**. It allows users to create a virtual portfolio, track real-time asset prices, and review transaction history.

https://github.com/user-attachments/assets/6247a645-212f-4b95-b390-f170d7361bec

## Requirements

Before running the application, make sure you have the following installed and configured:

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with:
  - Google Authentication enabled
  - Firestore database enabled
- Finnhub API key

## Features

- **User Authentication**: Sign in securely using your Google account via Firebase.
- **Real-Time Stock Prices**: Live stock data from Finnhub API for realistic simulation.
- **Buy & Sell Stocks**: Trade virtual shares with a simulated balance.
- **Watchlist**: Add favorite stocks to your personal watchlist.
- **Transaction History**: Track and review past buy/sell activity.
- **Responsive UI**: Built with Tailwind CSS and React for a seamless experience across devices.

## Project Structure
```
causality/
├── app/
│   ├── account/
│   |   ├── page.js             
│   ├── Components/
|   |   ├── account.js
|   |   ├── ...
|   ├── dashboard/
│   |   ├── page.js  
│   └── config.js                       
├── public/                
├── .env
└── ...
```

## How to Run

1. **Clone the repository**
```
git clone https://github.com/yourusername/causality.git
cd Causality/causality
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env` file in the root directory and add:
```env
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key
```

4. **Configure Firebase**
Create a Firebase project and update `/app/config.js` with your Firebase project credentials or include it in your `.env` file:
```js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

Open your browser and go to [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Sign in** with your Google account.
2. **Search and add** stocks to your watchlist.
3. **Buy and sell** stocks with your virtual balance.
4. **Monitor your portfolio** and review the transaction history.
5. **Simulate trading strategies** without any financial risk.

*Enjoy paper trading with Causality*
