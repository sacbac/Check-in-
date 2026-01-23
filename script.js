let selectedMood = null;
let userAccount = null;

// OLD CONTRACT
const CONTRACT_ADDRESS = "0x730f889F90b0DbCB295704d05f8CD96c5514b1F5";
const BASE_CHAIN_ID = "0x2105";

const ABI = [
  "function mintCheckInNFT(address to, string tokenURI)"
];

// ---------- UTILS ----------

function isBaseApp() {
  return !!window.baseSdk;
}

// ---------- CONNECT ----------

async function connectWallet() {
  if (isBaseApp()) {
    // ✅ BASE MINI APP WALLET
    try {
      const accounts = await window.baseSdk.wallet.requestAccounts();
      userAccount = accounts[0];

      document.getElementById("walletAddress").textContent =
        userAccount.slice(0, 6) + "..." + userAccount.slice(-4);
      document.getElementById("walletAddress").classList.remove("hidden");
      document.getElementById("connectWalletBtn").innerText = "✅ Connected";

    } catch (e) {
      alert("Base wallet connection cancelled");
    }

  } else {
    // ✅ NORMAL BROWSER (METAMASK)
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    userAccount = accounts[0];
    document.getElementById("walletAddress").textContent =
      userAccount.slice(0, 6) + "..." + userAccount.slice(-4);
    document.getElementById("walletAddress").classList.remove("hidden");
    document.getElementById("connectWalletBtn").innerText = "✅ Connected";
  }
}

// ---------- UI ----------

function selectMood(mood, e) {
  selectedMood = mood;
  document.querySelectorAll("button")
    .forEach(b => b.classList.remove("selected"));
  e.target.classList.add("selected");
}

// ---------- MINT ----------

async function submitCheckIn() {
  if (!userAccount) return alert("Connect wallet");
  if (!selectedMood) return alert("Select mood");

  const tokenURI =
    "https://check-in-amber-pi.vercel.app/metadata.json";

  if (isBaseApp()) {
    // ✅ BASE MINI APP TRANSACTION
    await window.baseSdk.wallet.sendTransaction({
      to: CONTRACT_ADDRESS,
      data: encodeMint(userAccount, tokenURI)
    });

    alert("NFT minted 🎉");

  } else {
    // ✅ METAMASK TRANSACTION
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.mintCheckInNFT(userAccount, tokenURI);
    await tx.wait();

    alert("NFT minted 🎉");
  }
}

// ---------- ABI ENCODER ----------

function encodeMint(to, uri) {
  const iface = new ethers.Interface(ABI);
  return iface.encodeFunctionData(
    "mintCheckInNFT",
    [to, uri]
  );
}

// ---------- INIT ----------

document.getElementById("connectWalletBtn")
  .addEventListener("click", connectWallet);

document.getElementById("todayDate").innerText =
  new Date().toDateString();
