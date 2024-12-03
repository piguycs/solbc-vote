import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Voting } from "../target/types/voting";
import { BankrunProvider, startAnchor } from "anchor-bankrun";

import IDL from "../target/idl/voting.json";

const POLL_ID = 1;
const POLL_DESCRIPTION = "What is your favourite distro?";
const START_DATE = 0;
const END_DATE = 1833412264;

const VOTING_ADDRESS = new PublicKey(
  "AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ",
);

describe("voting", () => {
  let context;
  let provider;
  let votingProgram: Program<Voting>;

  beforeAll(async () => {
    context = await startAnchor(
      "",
      [{ name: "voting", programId: VOTING_ADDRESS }],
      [],
    );
    provider = new BankrunProvider(context);
    votingProgram = new Program<Voting>(IDL as any, provider);
  });

  it("Initialize Voting", async () => {
    await votingProgram.methods
      .initialisePoll(
        new anchor.BN(POLL_ID),
        POLL_DESCRIPTION,
        new anchor.BN(START_DATE),
        new anchor.BN(END_DATE),
      )
      .rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(POLL_ID).toArrayLike(Buffer, "le", 8)],
      VOTING_ADDRESS,
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    expect(poll.pollId.toNumber()).toEqual(POLL_ID);
    expect(poll.description).toEqual(POLL_DESCRIPTION);
    expect(poll.pollStart.toNumber()).toEqual(START_DATE);
    expect(poll.pollEnd.toNumber()).toEqual(END_DATE);
  });

  it("Initialise Candidata", async () => {
    const CANDIDATE_NAMES = ["Arch Linux", "Ubuntu", "Fedora"];

    await votingProgram.methods
      .initialiseCandidate(CANDIDATE_NAMES[0], new anchor.BN(POLL_ID))
      .rpc();
    await votingProgram.methods
      .initialiseCandidate(CANDIDATE_NAMES[1], new anchor.BN(POLL_ID))
      .rpc();
    await votingProgram.methods
      .initialiseCandidate(CANDIDATE_NAMES[2], new anchor.BN(POLL_ID))
      .rpc();

    const [addressC0] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(POLL_ID).toArrayLike(Buffer, "le", 8),
        Buffer.from(CANDIDATE_NAMES[0]),
      ],
      VOTING_ADDRESS,
    );
    const c0 = await votingProgram.account.candidate.fetch(addressC0);

    const [addressC1] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(POLL_ID).toArrayLike(Buffer, "le", 8),
        Buffer.from(CANDIDATE_NAMES[1]),
      ],
      VOTING_ADDRESS,
    );
    const c1 = await votingProgram.account.candidate.fetch(addressC1);

    const [addressC2] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(POLL_ID).toArrayLike(Buffer, "le", 8),
        Buffer.from(CANDIDATE_NAMES[2]),
      ],
      VOTING_ADDRESS,
    );
    const c2 = await votingProgram.account.candidate.fetch(addressC2);

    console.debug({ c0, c1, c2 });

    expect(c0.candidateName).toEqual(CANDIDATE_NAMES[0]);
    expect(c1.candidateName).toEqual(CANDIDATE_NAMES[1]);
    expect(c2.candidateName).toEqual(CANDIDATE_NAMES[2]);

    expect(c0.candidateVotes.toNumber()).toEqual(0);
    expect(c1.candidateVotes.toNumber()).toEqual(0);
    expect(c2.candidateVotes.toNumber()).toEqual(0);
  });

  it("Vote for Candidate", async () => {});
});
