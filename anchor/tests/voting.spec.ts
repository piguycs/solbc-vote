import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Voting } from "../target/types/voting";
import { BankrunProvider, startAnchor } from "anchor-bankrun";

import IDL from "../target/idl/voting.json";

const votingAddress = new PublicKey(
  "AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ",
);

describe("voting", () => {
  it("Initialize Voting", async () => {
    const context = await startAnchor(
      "",
      [{ name: "voting", programId: votingAddress }],
      [],
    );
    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Voting>(IDL as any, provider);

    const ID = 1;
    const DESCRIPTION = "What is your favourite distro?";
    const START_DATE = 0;
    const END_DATE = 1833412264;

    await votingProgram.methods
      .initialisePoll(
        new anchor.BN(ID),
        DESCRIPTION,
        new anchor.BN(START_DATE),
        new anchor.BN(END_DATE),
      )
      .rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(ID).toArrayLike(Buffer, "le", 8)],
      votingAddress,
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    expect(poll.pollId.toNumber()).toEqual(ID);
    expect(poll.description).toEqual(DESCRIPTION);
    expect(poll.pollStart.toNumber()).toEqual(START_DATE);
    expect(poll.pollEnd.toNumber()).toEqual(END_DATE);
  });
});
