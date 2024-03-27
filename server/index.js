const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { randomPrivateKey, toHex } = require("ethereum-cryptography/utils")
const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");

app.use(cors());
app.use(express.json());

const balances = {
  "02ebf53e87939e726a968074bddc162640f8b36b343908a429914a649564b953d9": 100,
  "034c860581987216e672f8d30579a9454f9b71b8ba661e545e364593a7a67040d4": 50,
  "0265f154e95b626ec7cc169b4e164093f55be79aa2dd5bf1d998352583cc9683a4": 75,
};


app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, privateKey } = req.body;
  setInitialBalance(sender);
  setInitialBalance(recipient);
  const isVerified = verifySignature(sender, privateKey);

  if (isVerified) {
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.status(400).send({ message: "Invalid PrivateKey" });
  }
  });

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function verifySignature (sender, privateKey) {
  // Is the public key derivable from the private key
  try {
    const publicKey = toHex(secp256k1.getPublicKey(privateKey));
    console.log(publicKey);
    console.log(sender);
    if (publicKey == sender) {
      return true
    } else{
      return false
    }
  } catch (error) {
    console.error({ message: error.message });
  }
}

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
