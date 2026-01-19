let selectedMood = null;
let userAccount = null;

// ✅ YOUR DEPLOYED CONTRACT
const CONTRACT_ADDRESS = "0x730f889F90b0DbCB295704d05f8CD96c5514b1F5";

const CONTRACT_ABI = [
  "function mintCheckInNFT(address to, string tokenURI)"
];

function init() {
  document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });

  document
    .getElementById("connectWalletBtn")
    .addEventListener("click", connectWallet);
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }

  const accounts = await ethereum.request({
    method: "eth_requestAccounts"
  });

  userAccount = accounts[0];

  document.getElementById("connectWalletBtn").textContent = "✅ Connected";
  document.getElementById("walletAddress").textContent =
    `Wallet: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
  document.getElementById("walletAddress").classList.remove("hidden");
}

function selectMood(mood, event) {
  selectedMood = mood;
  document.querySelectorAll(".mood-btn").forEach(btn =>
    btn.classList.remove("selected")
  );
  event.currentTarget.classList.add("selected");
}

async function submitCheckIn() {
  if (!userAccount) {
    alert("Connect wallet first");
    return;
  }

  if (!selectedMood) {
    alert("Select a mood");
    return;
  }

  try {
    await mintNFT();
    showSuccess();
  } catch (err) {
    if (err.reason?.includes("Already minted")) {
      alert("❌ You already checked in today. Come back tomorrow!");
    } else {
      console.error(err);
      alert("Transaction failed");
    }
  }
}

async function mintNFT() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );

  const metadata = {
    name: "Daily Check-In NFT",
    description: "One NFT per day emotional check-in",
    attributes: [
      { trait_type: "Mood", value: selectedMood },
      { trait_type: "Date", value: new Date().toDateString() }
    ]
  };

  const tokenURI =
    "data:application/json;base64," +
    btoa(JSON.stringify(metadata));

  const tx = await contract.mintCheckInNFT(userAccount, tokenURI);
  await tx.wait();
}

function showSuccess() {
  document.getElementById("checkInForm").classList.add("hidden");
  document.getElementById("successMessage").classList.remove("hidden");

  setTimeout(() => {
    document.getElementById("checkInForm").classList.remove("hidden");
    document.getElementById("successMessage").classList.add("hidden");
    selectedMood = null;
    document.querySelectorAll(".mood-btn").forEach(btn =>
      btn.classList.remove("selected")
    );
  }, 3000);
}

init();
