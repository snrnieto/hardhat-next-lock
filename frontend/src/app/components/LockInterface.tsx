'use client';

import { useLock } from '@/context/LockContext';

export default function LockInterface() {
    const {
        amount,
        setAmount,
        duration,
        setDuration,
        balance,
        unlockTime,
        loading,
        error,
        connected,
        timeLeft,
        handleConnect,
        handleDeposit,
        handleWithdraw,
        formatDate
    } = useLock();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-2xl border border-purple-500/20 backdrop-blur-sm">
                {!connected ? (
                    <button
                        onClick={handleConnect}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] font-medium tracking-wide"
                    >
                        Connect Wallet
                    </button>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-white bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Your Lock Details</h2>
                            <div className="space-y-2 text-gray-300">
                                <p className="flex justify-between items-center">
                                    <span>Balance:</span>
                                    <span className="font-mono text-purple-400">{balance} ETH</span>
                                </p>
                                <p className="flex justify-between items-center">
                                    <span>Unlock Time:</span>
                                    <span className="font-mono text-blue-400">{formatDate(unlockTime)}</span>
                                </p>
                                <p className="flex justify-between items-center">
                                    <span>Time Remaining:</span>
                                    <span className="font-mono text-green-400">{timeLeft || 'No active lock'}</span>
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleDeposit} className="mb-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Amount (ETH)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    step="0.01"
                                    required
                                />
                            </div>
                            {
                                balance === "0" || balance==="0.0" && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Lock Duration (days)</label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                            required
                                        />
                                    </div>
                                )
                            }
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium tracking-wide"
                            >
                                {loading ? 'Processing...' : 'Deposit'}
                            </button>
                        </form>

                        {balance !== "0" && (
                            <button
                                onClick={handleWithdraw}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium tracking-wide"
                            >
                                {loading ? 'Processing...' : 'Withdraw'}
                            </button>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-red-900/30 border border-red-500/20 rounded-xl text-red-200 backdrop-blur-sm animate-fade-in shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm opacity-90">{error}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}