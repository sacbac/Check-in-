let selectedMood = null;
let userAccount = null;

// OLD CONTRACT
const CONTRACT_ADDRESS = "0x730f889F90b0DbCB295704d05f8CD96c5514b1F5";
const BASE_CHAIN_ID = "0x2105";

const CONTRACT_ABI = [
  "function mintCheckInNFT(address to, string tokenURI)"
];

async function init() {
  document.getElementById("todayDate").textContent =
    new Date().toDateString();

  document
    .getElementById("connectWalletBtn")
    .addEventListener("click", connectWallet);
}

async function connectWallet() {
  // 🔑 THIS IS THE KEY FIX
  if (!window.ethereum) {
    alert(
      "No wallet detected.\n\n" +
      "• Open this app inside the Base app\n" +
      "• OR install MetaMask"
    );
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    if (!accounts || !accounts.length) {
      alert("Wallet connection cancelled");
      return;
    }

    userAccount = accounts[0];

    // Switch to Base if needed
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_ID }]
      });
    } catch {}

    document.getElementById("connectWalletBtn").textContent = "✅ Connected";
    document.getElementById("walletAddress").textContent =
      userAccount.slice(0, 6) + "..." + userAccount.slice(-4);
    document.getElementById("walletAddress").classList.remove("hidden");

  } catch (err) {
    console.error(err);
    alert("Wallet connection failed");
  }
}

function selectMood(mood, event) {
  selectedMood = mood;
  document.querySelectorAll(".mood-btn")
    .forEach(b => b.classList.remove("selected"));
  event.target.classList.add("selected");
}

async function submitCheckIn() {
  if (!userAccount) return alert("Connect wallet first");
  if (!selectedMood) return alert("Select a mood");

  document.getElementById("loading").classList.remove("hidden");

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    const tokenURI =
      "https://check-in-amber-pi.vercel.app/metadata.json";

    const tx = await contract.mintCheckInNFT(
      userAccount,
      tokenURI
    );

    await tx.wait();

    document.getElementById("success").classList.remove("hidden");

  } catch (err) {
    console.error(err);
    alert("Mint failed");
  }

  document
let userAccount = null;
let providerRaw = null;

// 🔴 OLD CONTRACT ADDRESS
const CONTRACT_ADDRESS = "0x730f889F90b0DbCB295704d05f8CD96c5514b1F5";
const BASE_CHAIN_ID = "0x2105";

const CONTRACT_ABI = [
  "function mintCheckInNFT(address to, string tokenURI)"
];

async function init() {
  document.getElementById("todayDate").textContent =
    new Date().toDateString();

  if (window.baseSdk?.actions?.ready) {
    try {
      await window.baseSdk.actions.ready();
    } catch {}
  }

  document
    .getElementById("connectWalletBtn")
    .addEventListener("click", connectWallet);
}

async function getProvider() {
  if (window.baseSdk?.wallet?.getEthereumProvider) {
    return await window.baseSdk.wallet.getEthereumProvider();
  }
  if (window.ethereum) return window.ethereum;
  throw new Error("No wallet found");
}

async function connectWallet() {
  try {
    providerRaw = await getProvider();

    const accounts = await providerRaw.request({
      method: "eth_requestAccounts"
    });

    userAccount = accounts[0];

    try {
      await providerRaw.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_ID }]
      });
    } catch {}

    document.getElementById("connectWalletBtn").textContent = "✅ Connected";
    document.getElementById("walletAddress").textContent =
      userAccount.slice(0, 6) + "..." + userAccount.slice(-4);
    document.getElementById("walletAddress").classList.remove("hidden");

  } catch (err) {
    alert("Wallet connection failed");
  }
}

function selectMood(mood, event) {
  selectedMood = mood;
  document.querySelectorAll(".mood-btn")
    .forEach(b => b.classList.remove("selected"));
  event.target.classList.add("selected");
}

async function submitCheckIn() {
  if (!userAccount) return alert("Connect wallet first");
  if (!selectedMood) return alert("Select a mood");

  document.getElementById("loading").classList.remove("hidden");

  try {
    const provider = new ethers.BrowserProvider(providerRaw);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    const tokenURI =
      "https://check-in-amber-pi.vercel.app/metadata.json";

    const tx = await contract.mintCheckInNFT(
      userAccount,
      tokenURI
    );

    await tx.wait();

    document.getElementById("success").classList.remove("hidden");

  } catch (err) {
    alert("Mint failed");
  }

  document.getElementById("loading").classList.add("hidden");
}

init();
