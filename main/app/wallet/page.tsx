import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";

const WalletInfo = () => {
    const { primaryWallet, user, handleLogOut } = useDynamicContext();

    if (!primaryWallet) return null;

    return (
        <div className="space-y-4 p-6">
            <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Connected Address:</p>
                <p className="font-mono">{primaryWallet.address}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Email:</p>
                <p>{user?.email || "Not provided"}</p>
            </div>
            <button
                onClick={handleLogOut}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
                Disconnect
            </button>
        </div>
    );
};

const App = () => {
    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
                            Dynamic Wallet
                        </h1>
                        <DynamicWidget />
                        <WalletInfo />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;

