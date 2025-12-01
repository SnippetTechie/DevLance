import { expect } from "chai";
import { ethers } from "hardhat";
import { DevLance } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DevLance Contract", function () {
    let devLance: DevLance;
    let client: SignerWithAddress;
    let developer: SignerWithAddress;
    let other: SignerWithAddress;

    const IPFS_CID = "QmTest123456789";
    const AMOUNT_ETH = ethers.parseEther("1.0"); // 1 ETH
    const DEADLINE_DAYS = 7;
    const SECURITY_HOLD_BPS = 500n; // 5%
    const BASIS_POINTS = 10000n;

    beforeEach(async function () {
        [client, developer, other] = await ethers.getSigners();

        const DevLanceFactory = await ethers.getContractFactory("DevLance");
        devLance = await DevLanceFactory.deploy();
        await devLance.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should deploy with nextJobId = 0", async function () {
            expect(await devLance.nextJobId()).to.equal(0);
        });

        it("Should have correct security hold percentage", async function () {
            expect(await devLance.SECURITY_HOLD_BPS()).to.equal(SECURITY_HOLD_BPS);
            expect(await devLance.BASIS_POINTS()).to.equal(BASIS_POINTS);
        });
    });

    describe("Create Gig", function () {
        it("Should create a gig with correct parameters", async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;

            const tx = await devLance.connect(client).createGig(
                IPFS_CID,
                AMOUNT_ETH,
                DEADLINE_DAYS,
                { value: totalValue }
            );

            await expect(tx)
                .to.emit(devLance, "JobCreated")
                .withArgs(0, client.address, IPFS_CID, AMOUNT_ETH, (deadline: any) => true);

            const job = await devLance.getJob(0);
            expect(job.id).to.equal(0);
            expect(job.client).to.equal(client.address);
            expect(job.developer).to.equal(ethers.ZeroAddress);
            expect(job.amount).to.equal(AMOUNT_ETH);
            expect(job.securityHold).to.equal(securityHold);
            expect(job.originalAmount).to.equal(totalValue);
            expect(job.ipfsCID).to.equal(IPFS_CID);
            expect(job.submission).to.equal("");
            expect(job.status).to.equal(0); // Status.Open
        });

        it("Should refund excess payment", async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;
            const excess = ethers.parseEther("0.5");
            const sentValue = totalValue + excess;

            const balanceBefore = await ethers.provider.getBalance(client.address);

            const tx = await devLance.connect(client).createGig(
                IPFS_CID,
                AMOUNT_ETH,
                DEADLINE_DAYS,
                { value: sentValue }
            );

            const receipt = await tx.wait();
            const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
            const balanceAfter = await ethers.provider.getBalance(client.address);

            // Client should only pay totalValue + gas, excess should be refunded
            expect(balanceBefore - balanceAfter).to.be.closeTo(
                totalValue + gasUsed,
                ethers.parseEther("0.001") // Small tolerance for gas variations
            );
        });

        it("Should fail with empty IPFS CID", async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;

            await expect(
                devLance.connect(client).createGig("", AMOUNT_ETH, DEADLINE_DAYS, { value: totalValue })
            ).to.be.revertedWith("IPFS CID required");
        });

        it("Should fail with zero amount", async function () {
            await expect(
                devLance.connect(client).createGig(IPFS_CID, 0, DEADLINE_DAYS, { value: 0 })
            ).to.be.revertedWith("Amount must be > 0");
        });

        it("Should fail with invalid deadline", async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;

            await expect(
                devLance.connect(client).createGig(IPFS_CID, AMOUNT_ETH, 0, { value: totalValue })
            ).to.be.revertedWith("Deadline must be 1-365 days");

            await expect(
                devLance.connect(client).createGig(IPFS_CID, AMOUNT_ETH, 366, { value: totalValue })
            ).to.be.revertedWith("Deadline must be 1-365 days");
        });

        it("Should fail with insufficient payment", async function () {
            const insufficientValue = AMOUNT_ETH; // Missing security hold

            await expect(
                devLance.connect(client).createGig(IPFS_CID, AMOUNT_ETH, DEADLINE_DAYS, { value: insufficientValue })
            ).to.be.revertedWith("Insufficient payment");
        });
    });

    describe("Accept Job", function () {
        beforeEach(async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;
            await devLance.connect(client).createGig(IPFS_CID, AMOUNT_ETH, DEADLINE_DAYS, { value: totalValue });
        });

        it("Should allow developer to accept job", async function () {
            const tx = await devLance.connect(developer).acceptJob(0);

            await expect(tx)
                .to.emit(devLance, "JobAccepted")
                .withArgs(0, developer.address);

            const job = await devLance.getJob(0);
            expect(job.developer).to.equal(developer.address);
            expect(job.status).to.equal(1); // Status.InProgress
        });

        it("Should fail if client tries to accept own job", async function () {
            await expect(
                devLance.connect(client).acceptJob(0)
            ).to.be.revertedWith("Client cannot accept own job");
        });

        it("Should fail if job doesn't exist", async function () {
            await expect(
                devLance.connect(developer).acceptJob(999)
            ).to.be.revertedWith("Job does not exist");
        });

        it("Should fail if job already accepted", async function () {
            await devLance.connect(developer).acceptJob(0);

            await expect(
                devLance.connect(other).acceptJob(0)
            ).to.be.revertedWith("Job not open");
        });
    });

    describe("Submit Work", function () {
        const SUBMISSION = "ipfs://QmSubmission123";

        beforeEach(async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;
            await devLance.connect(client).createGig(IPFS_CID, AMOUNT_ETH, DEADLINE_DAYS, { value: totalValue });
            await devLance.connect(developer).acceptJob(0);
        });

        it("Should allow developer to submit work", async function () {
            const tx = await devLance.connect(developer).submitWork(0, SUBMISSION);

            await expect(tx)
                .to.emit(devLance, "WorkSubmitted")
                .withArgs(0, SUBMISSION);

            const job = await devLance.getJob(0);
            expect(job.submission).to.equal(SUBMISSION);
            expect(job.status).to.equal(2); // Status.Submitted
        });

        it("Should fail if not developer", async function () {
            await expect(
                devLance.connect(other).submitWork(0, SUBMISSION)
            ).to.be.revertedWith("Only developer");
        });

        it("Should fail with empty submission", async function () {
            await expect(
                devLance.connect(developer).submitWork(0, "")
            ).to.be.revertedWith("Submission required");
        });

        it("Should fail if job not in progress", async function () {
            // First submit work to change status to Submitted
            await devLance.connect(developer).submitWork(0, SUBMISSION);

            // Now try to submit again - should fail because job is no longer InProgress
            await expect(
                devLance.connect(developer).submitWork(0, "Another submission")
            ).to.be.revertedWith("Job not in progress");
        });
    });

    describe("Release Full Payment", function () {
        beforeEach(async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;
            await devLance.connect(client).createGig(IPFS_CID, AMOUNT_ETH, DEADLINE_DAYS, { value: totalValue });
            await devLance.connect(developer).acceptJob(0);
            await devLance.connect(developer).submitWork(0, "ipfs://submission");
        });

        it("Should release full payment to developer", async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalPayout = AMOUNT_ETH + securityHold;

            const balanceBefore = await ethers.provider.getBalance(developer.address);

            const tx = await devLance.connect(client).releaseFullPayment(0);

            await expect(tx)
                .to.emit(devLance, "FullPaymentReleased")
                .withArgs(0, developer.address, totalPayout);

            const balanceAfter = await ethers.provider.getBalance(developer.address);
            expect(balanceAfter - balanceBefore).to.equal(totalPayout);

            const job = await devLance.getJob(0);
            expect(job.amount).to.equal(0);
            expect(job.securityHold).to.equal(0);
            expect(job.status).to.equal(3); // Status.Completed
        });

        it("Should fail if not client", async function () {
            await expect(
                devLance.connect(other).releaseFullPayment(0)
            ).to.be.revertedWith("Only client");
        });

        it("Should fail if job not submitted", async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;
            await devLance.connect(client).createGig(IPFS_CID, AMOUNT_ETH, DEADLINE_DAYS, { value: totalValue });

            await expect(
                devLance.connect(client).releaseFullPayment(1)
            ).to.be.revertedWith("Job not submitted");
        });
    });

    describe("Release Partial Payment", function () {
        beforeEach(async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;
            await devLance.connect(client).createGig(IPFS_CID, AMOUNT_ETH, DEADLINE_DAYS, { value: totalValue });
            await devLance.connect(developer).acceptJob(0);
            await devLance.connect(developer).submitWork(0, "ipfs://submission");
        });

        it("Should release partial payment correctly", async function () {
            const partialAmount = ethers.parseEther("0.5"); // 50% of amount
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalAvailable = AMOUNT_ETH + securityHold;
            const refund = totalAvailable - partialAmount;

            const devBalanceBefore = await ethers.provider.getBalance(developer.address);
            const clientBalanceBefore = await ethers.provider.getBalance(client.address);

            const tx = await devLance.connect(client).releasePartialPayment(0, partialAmount);
            const receipt = await tx.wait();
            const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

            await expect(tx)
                .to.emit(devLance, "PartialPaymentReleased")
                .withArgs(0, developer.address, partialAmount, refund);

            const devBalanceAfter = await ethers.provider.getBalance(developer.address);
            const clientBalanceAfter = await ethers.provider.getBalance(client.address);

            expect(devBalanceAfter - devBalanceBefore).to.equal(partialAmount);
            expect(clientBalanceAfter - clientBalanceBefore).to.equal(refund - gasUsed);

            const job = await devLance.getJob(0);
            expect(job.amount).to.equal(0);
            expect(job.securityHold).to.equal(0);
            expect(job.status).to.equal(4); // Status.Cancelled
        });

        it("Should fail with zero amount", async function () {
            await expect(
                devLance.connect(client).releasePartialPayment(0, 0)
            ).to.be.revertedWith("Must pay > 0");
        });

        it("Should fail if amount >= total amount", async function () {
            await expect(
                devLance.connect(client).releasePartialPayment(0, AMOUNT_ETH)
            ).to.be.revertedWith("Use full release for 100%");
        });
    });

    describe("Cancel Job", function () {
        it("Should allow client to cancel open job", async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;
            await devLance.connect(client).createGig(IPFS_CID, AMOUNT_ETH, DEADLINE_DAYS, { value: totalValue });

            const balanceBefore = await ethers.provider.getBalance(client.address);

            const tx = await devLance.connect(client).cancelJob(0);
            const receipt = await tx.wait();
            const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

            await expect(tx)
                .to.emit(devLance, "JobCancelled")
                .withArgs(0, totalValue);

            const balanceAfter = await ethers.provider.getBalance(client.address);
            expect(balanceAfter - balanceBefore).to.equal(totalValue - gasUsed);

            const job = await devLance.getJob(0);
            expect(job.amount).to.equal(0);
            expect(job.securityHold).to.equal(0);
            expect(job.status).to.equal(4); // Status.Cancelled
        });

        it("Should fail if not client", async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;
            await devLance.connect(client).createGig(IPFS_CID, AMOUNT_ETH, DEADLINE_DAYS, { value: totalValue });

            await expect(
                devLance.connect(other).cancelJob(0)
            ).to.be.revertedWith("Only client");
        });

        it("Should fail if job not open", async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;
            await devLance.connect(client).createGig(IPFS_CID, AMOUNT_ETH, DEADLINE_DAYS, { value: totalValue });
            await devLance.connect(developer).acceptJob(0);

            await expect(
                devLance.connect(client).cancelJob(0)
            ).to.be.revertedWith("Can cancel only when open");
        });
    });

    describe("Helper Functions", function () {
        beforeEach(async function () {
            const securityHold = (AMOUNT_ETH * SECURITY_HOLD_BPS) / BASIS_POINTS;
            const totalValue = AMOUNT_ETH + securityHold;
            await devLance.connect(client).createGig(IPFS_CID, AMOUNT_ETH, DEADLINE_DAYS, { value: totalValue });
        });

        it("Should return job metadata", async function () {
            const metadata = await devLance.getJobMetadata(0);
            expect(metadata).to.equal(IPFS_CID);
        });

        it("Should check deadline correctly", async function () {
            const isPassed = await devLance.isDeadlinePassed(0);
            expect(isPassed).to.be.false;

            // Fast forward time beyond deadline
            await ethers.provider.send("evm_increaseTime", [DEADLINE_DAYS * 24 * 60 * 60 + 1]);
            await ethers.provider.send("evm_mine", []);

            const isPassedAfter = await devLance.isDeadlinePassed(0);
            expect(isPassedAfter).to.be.true;
        });

        it("Should fail getJobMetadata for non-existent job", async function () {
            await expect(
                devLance.getJobMetadata(999)
            ).to.be.revertedWith("Job does not exist");
        });
    });
});
