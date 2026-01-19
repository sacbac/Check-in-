let selectedMood = null;
let userAccount = null;

const CONTRACT_ADDRESS = "0x730f889F90b0DbCB295704d05f8CD96c5514b1F5";

const CONTRACT_ABI = [
  "function mintCheckInNFT(address to, string tokenURI)"
];

function init() {
  document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
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

  document.getElementById("connectWalletBtn").textContent =
    "✅ Wallet Connected";

  const addr = document.getElementById("walletAddress");
  addr.textContent = `${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
  addr.classList.remove("hidden");
}

function selectMood(mood, event) {
  selectedMood = mood;
  document.querySelectorAll(".mood-btn").forEach(btn =>
    btn.classList.remove("selected")
  );
  event.currentTarget.classList.add("selected");
}

async function submitCheckIn() {
  if (!userAccount) return alert("Connect wallet first");
  if (!selectedMood) return alert("Select a mood");

  toggleLoading(true);

  try {
    await mintNFT();
    showSuccess();
  } catch (err) {
    if (err.reason?.includes("Already minted")) {
      alert("You already checked in today 🌙");
    } else {
      alert("Transaction failed");
      console.error(err);
    }
  }

  toggleLoading(false);
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

function toggleLoading(state) {
  document.getElementById("checkInForm").classList.toggle("hidden", state);
  document.getElementById("loadingState").classList.toggle("hidden", !state);
  document.getElementById("checkInBtn").disabled = state;
}

function showSuccess() {
  document.getElementById("successMessage").classList.remove("hidden");

  setTimeout(() => {
    document.getElementById("successMessage").classList.add("hidden");
    document.getElementById("checkInForm").classList.remove("hidden");
    selectedMood = null;
    document.querySelectorAll(".mood-btn").forEach(btn =>
      btn.classList.remove("selected")
    );
  }, 2500);
}

init();
