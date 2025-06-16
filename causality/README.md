# Causality

Causality is a full-stack web application for tracking your stock portfolio, purchases, and assets in real time. It features user authentication, a watchlist, asset management, and live price updates using the Finnhub API. The app is built with React (Next.js) and Firebase for authentication and data storage.
## Features

- **User Authentication:** Secure sign-in and sign-out with Firebase Auth.
- **Watchlist:** Add, view, and remove stocks from your personal watchlist.
- **Purchases & Assets:** Buy and sell stocks, track your purchase history, and view your current assets.
- **Live Price Updates:** Fetches real-time stock prices and calculates day percent change.
- **Balance Management:** Simulated account balance for buying and selling stocks.
- **Responsive UI:** Modern, responsive design with React and Tailwind CSS.
- **Notifications:** Toast notifications for actions like purchases, sales, and errors.

## Technologies Used

- **Frontend:** React (Next.js), Tailwind CSS, React Toastify, Moment.js
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Stock Data:** [Finnhub API](https://finnhub.io/)

## Getting Started

### Prerequisites

- Node.js & npm
- Firebase project (for Auth and Firestore)
- Finnhub API key

### Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/yourusername/causality.git
    cd causality
    ```

2. **Install frontend dependencies:**
    ```sh
    npm install
    ```

3. **Set up environment variables:**
    - Create a `.env.local` file in the root directory:
      ```
      NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key
      ```

4. **Configure Firebase:**
    - Add your Firebase config to `config.js` or as environment variables.

5. **Run the Next.js frontend:**
    ```sh
    npm run dev
    ```

6. **Visit the app:**
    - Frontend: [http://localhost:3000](http://localhost:3000)

## Usage

- **Sign in** to your account.
- **Add stocks** to your watchlist.
- **Buy or sell** assets using your simulated balance.
- **Track your purchases** and current asset values.
- **Remove stocks** from your watchlist as needed.

## Folder Structure

```
causality/
├── app/
│   └── Components/
│       ├── account.js
│       ├── dashboard.js
│       └── ...
├── public/
├── styles/
├── .env.local
├── package.json
└── README.md
```

## License

This project is licensed under the MIT License.

---