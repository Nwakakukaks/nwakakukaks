import { ConcealedCare, Requirements } from './ConcealedCare.js';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  Bool,
  Poseidon,
} from 'snarkyjs';

await isReady;

const report = {
  patientIdHash: new Field(12345678),
  validUntil: new Field(20230430),
  bloodPressure: new Field(80),
  hasConditionA: new Bool(true),
  hasConditionB: new Bool(false),
  hasConditionC: new Bool(true),
};

const requirements = {
  patientIdHash: new Field(12345678),
  verifyTime: new Field(20230422),
  minBloodPressure: new Field(60),
  maxBloodPressure: new Field(120),
  allowConditionA: new Bool(true),
  allowConditionB: new Bool(true),
  allowConditionC: new Bool(false),
};

function reqsToArray(requirements: Requirements) {
  return [
    new Field(requirements.patientIdHash),
    new Field(requirements.verifyTime),
    new Field(requirements.minBloodPressure),
    new Field(requirements.maxBloodPressure),
    new Bool(requirements.allowConditionA).toField(),
    new Bool(requirements.allowConditionB).toField(),
    new Bool(requirements.allowConditionC).toField(),
  ]
}

const useProof = false;
const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new ConcealedCare(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// DOCTOR PUBLISH REPORT

const publishTxn = await Mina.transaction(senderAccount, () => {
  zkAppInstance.publishReport(report);
});

await publishTxn.prove();
const signRes = await publishTxn.sign([senderKey]).send();

console.log('publishTxn.toPretty()', publishTxn.toPretty());
console.log('signRes', signRes);
console.log('signRes.hash()', signRes.hash());

// EMPLOYEE PUBLISH PROOF

const publishAccommodationProofTxn = await Mina.transaction(
  senderAccount,
  () => {
    zkAppInstance.publishAccommodationProof(report, requirements);
  }
);

await publishAccommodationProofTxn.prove();
const publishAccommodationProofRes = await publishAccommodationProofTxn
  .sign([senderKey])
  .send();

// EMPLOYER CHECK PROOF #1

const curHash = zkAppInstance.verifiedRequirementsHash.get()
const desiredHash = Poseidon.hash(reqsToArray(requirements))
// console.log('curHash', curHash)
// console.log('desiredHash', desiredHash)
if (JSON.stringify(curHash) == JSON.stringify(desiredHash)) {
  console.log('Requirements hash verified!')
} else {
  console.log('FAILED! Requirements hash not verified')
}

// EMPLOYER CHECK PROOF #2

const verifyAccommodationProofTxn = await Mina.transaction(
  senderAccount,
  () => {
    zkAppInstance.verifyAccommodationProof(requirements);
  }
);

await verifyAccommodationProofTxn.prove();
const verifyAccommodationProofRes = await verifyAccommodationProofTxn
  .sign([senderKey])
  .send();

// END

console.log('Shutting down');
await shutdown();
