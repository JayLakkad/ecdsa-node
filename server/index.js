const express = require("express");
const app = express();
const cors = require("cors");
const secp256k1 = require("ethereum-cryptography/secp256k1");
const { toHex,utf8ToBytes } = require("ethereum-cryptography/utils");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "022c6c637b349f8c9cd094e72f55e7e912ca7b7a5d7820dadd85cdeca8cab63bd4": 100,//jay
  "02bfb6771570b087676a7b7cac64b74ef8af1163bb736a7eec7bcd63fbb920da36": 50,//ansh
  "0218ab100315f12341d28f262a7444bd9cb5febb199542aae6b12373741a8e9bfc": 75,//aryansh
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send",async (req, res) => {
  const { sender, recipient, amount,signature,recovery } = req.body;
  if(!signature) res.status(404).send({ message: "Signature not found!" });
  if(!recovery) res.status(404).send({ message: "Recovery not found!" });
 try {
  const bytes = utf8ToBytes(JSON.stringify({ sender, recipient, amount }));
  const hash = keccak256(bytes);
  const sig = new Uint8Array(signature);
  const publicKey = await secp256k1.recoverPublicKey(hash, sig, recovery);
  if(toHex(publicKey) !== sender) res.status(404).send({ message: "Invalid Signature!" });
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
 } catch (error) {
  console.log(error.message);
 }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
