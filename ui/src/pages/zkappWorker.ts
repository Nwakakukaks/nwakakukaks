import { Mina, isReady, PublicKey, fetchAccount } from 'snarkyjs';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { ConcealedCare, Report, Requirements } from '../../../contracts/src/ConcealedCare';

const state = {
  ConcealedCare: null as null | typeof ConcealedCare,
  zkapp: null as null | ConcealedCare,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  loadSnarkyJS: async (args: {}) => {
    await isReady;
  },
  setActiveInstanceToBerkeley: async (args: {}) => {
    const Berkeley = Mina.Network(
      'https://proxy.berkeley.minaexplorer.com/graphql'
    );
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async (args: {}) => {
    const { ConcealedCare } = await import('../../../contracts/build/src/ConcealedCare.js');
    state.ConcealedCare = ConcealedCare;
  },
  compileContract: async (args: {}) => {
    await state.ConcealedCare!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.ConcealedCare!(publicKey);
  },
  getRequirementsHash: async (args: {}) => {
    const currentNum = await state.zkapp!.verifiedRequirementsHash.fetch();
    return JSON.stringify(currentNum!.toJSON());
  },
  createPublishReportTransaction: async (args: { report: Report }) => {
    const transaction = await Mina.transaction(() => {
      state.zkapp!.publishReport(args.report);
    });
    state.transaction = transaction;
  },
  createPublishAccomProofTransaction: async (args: { report: Report, requirements: Requirements }) => {
    const transaction = await Mina.transaction(() => {
      state.zkapp!.publishAccommodationProof(args.report, args.requirements);
    });
    state.transaction = transaction;
  },
  createVerifyAccomProofTransaction: async (args: { requirements: Requirements }) => {
    console.log('createVerifyAccomProofTransaction: ', args.requirements)
    const transaction = await Mina.transaction(() => {
      state.zkapp!.verifyAccommodationProof(args.requirements);
    });
    state.transaction = transaction;
  },
  proveTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};
if (process.browser) {
  addEventListener(
    'message',
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );
}
