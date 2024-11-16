import UniswapDashboard from "./components/UniswapDashboard";

const App = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-xl font-bold text-gray-900">
                        Uniswap Analytics Dashboard
                    </h1>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <UniswapDashboard />
            </main>

            <footer className="bg-white border-t mt-8">
                <div className="container mx-auto px-4 py-4 text-center text-gray-600">
                    Powered by The Graph Protocol & Uniswap V3
                </div>
            </footer>
        </div>
    );
};

export default App;
