// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DevLance {
    enum Status { Open, InProgress, Submitted, Completed, Cancelled }

    struct Job {
        uint256 id;
        address payable client;
        address payable developer;
        uint256 amount;          
        uint256 securityHold;    
        uint256 originalAmount;  
        string ipfsCID;          
        string submission;       
        uint256 deadline;        
        Status status;
    }

    uint256 public nextJobId;
    mapping(uint256 => Job) public jobs;

    // Security hold percentage (5% = 500 basis points)
    uint256 public constant SECURITY_HOLD_BPS = 500;
    uint256 public constant BASIS_POINTS = 10000;

    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        string ipfsCID,
        uint256 amount,
        uint256 deadline
    );

    event JobAccepted(
        uint256 indexed jobId,
        address indexed developer
    );

    event WorkSubmitted(
        uint256 indexed jobId,
        string submission
    );

    event FullPaymentReleased(
        uint256 indexed jobId,
        address indexed developer,
        uint256 amount
    );

    event PartialPaymentReleased(
        uint256 indexed jobId,
        address indexed developer,
        uint256 paidToDeveloper,
        uint256 refundedToClient
    );

    event JobCancelled(
        uint256 indexed jobId,
        uint256 refundedToClient
    );


    function createGig(
        string calldata ipfsCID,
        uint256 amountWei,
        uint256 deadlineDays
    ) external payable returns (uint256 jobId) {
        require(bytes(ipfsCID).length > 0, "IPFS CID required");
        require(amountWei > 0, "Amount must be > 0");
        require(deadlineDays > 0 && deadlineDays <= 365, "Deadline must be 1-365 days");

        // Calculate security hold (5% of amount)
        uint256 securityHold = (amountWei * SECURITY_HOLD_BPS) / BASIS_POINTS;
        uint256 totalRequired = amountWei + securityHold;

        require(msg.value >= totalRequired, "Insufficient payment");

        uint256 deadline = block.timestamp + (deadlineDays * 1 days);

        jobId = nextJobId++;
        Job storage j = jobs[jobId];

        j.id = jobId;
        j.client = payable(msg.sender);
        j.developer = payable(address(0));
        j.amount = amountWei;
        j.securityHold = securityHold;
        j.originalAmount = totalRequired;
        j.ipfsCID = ipfsCID;
        j.submission = "";
        j.deadline = deadline;
        j.status = Status.Open;

        if (msg.value > totalRequired) {
            uint256 excess = msg.value - totalRequired;
            (bool sent, ) = msg.sender.call{value: excess}("");
            require(sent, "Excess refund failed");
        }

        emit JobCreated(jobId, msg.sender, ipfsCID, amountWei, deadline);
    }

    function acceptJob(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(j.client != address(0), "Job does not exist");
        require(j.status == Status.Open, "Job not open");
        require(j.developer == address(0), "Already accepted");
        require(msg.sender != j.client, "Client cannot accept own job");

        j.developer = payable(msg.sender);
        j.status = Status.InProgress;

        emit JobAccepted(jobId, msg.sender);
    }

    function submitWork(uint256 jobId, string calldata submission) external {
        Job storage j = jobs[jobId];
        require(j.client != address(0), "Job does not exist");
        require(msg.sender == j.developer, "Only developer");
        require(j.status == Status.InProgress, "Job not in progress");
        require(bytes(submission).length > 0, "Submission required");

        j.submission = submission;
        j.status = Status.Submitted;

        emit WorkSubmitted(jobId, submission);
    }

    function releaseFullPayment(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(j.client != address(0), "Job does not exist");
        require(msg.sender == j.client, "Only client");
        require(j.status == Status.Submitted, "Job not submitted");
        require(j.developer != address(0), "No developer");

        uint256 totalPayout = j.amount + j.securityHold;
        require(totalPayout > 0, "No funds in escrow");

        j.amount = 0;
        j.securityHold = 0;
        j.status = Status.Completed;

        (bool sent, ) = j.developer.call{value: totalPayout}("");
        require(sent, "Transfer failed");

        emit FullPaymentReleased(jobId, j.developer, totalPayout);
    }

    function releasePartialPayment(uint256 jobId, uint256 amountToDeveloper) external {
        Job storage j = jobs[jobId];
        require(j.client != address(0), "Job does not exist");
        require(msg.sender == j.client, "Only client");
        require(j.status == Status.Submitted, "Job not submitted");
        require(j.developer != address(0), "No developer");
        require(amountToDeveloper > 0, "Must pay > 0");
        require(amountToDeveloper < j.amount, "Use full release for 100%");

        uint256 totalAvailable = j.amount + j.securityHold;
        uint256 refund = totalAvailable - amountToDeveloper;

        j.amount = 0;
        j.securityHold = 0;
        j.status = Status.Cancelled;

        // Pay developer
        (bool sentDev, ) = j.developer.call{value: amountToDeveloper}("");
        require(sentDev, "Dev transfer failed");

        // Refund client
        (bool sentClient, ) = j.client.call{value: refund}("");
        require(sentClient, "Client refund failed");

        emit PartialPaymentReleased(jobId, j.developer, amountToDeveloper, refund);
    }

    function cancelJob(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(j.client != address(0), "Job does not exist");
        require(msg.sender == j.client, "Only client");
        require(j.status == Status.Open, "Can cancel only when open");

        uint256 refund = j.amount + j.securityHold;
        require(refund > 0, "No funds in escrow");

        j.amount = 0;
        j.securityHold = 0;
        j.status = Status.Cancelled;

        (bool sent, ) = j.client.call{value: refund}("");
        require(sent, "Refund failed");

        emit JobCancelled(jobId, refund);
    }

    function getJob(uint256 jobId)
        external
        view
        returns (
            uint256 id,
            address client,
            address developer,
            uint256 amount,
            uint256 securityHold,
            uint256 originalAmount,
            string memory ipfsCID,
            string memory submission,
            uint256 deadline,
            Status status
        )
    {
        Job storage j = jobs[jobId];
        return (
            j.id,
            j.client,
            j.developer,
            j.amount,
            j.securityHold,
            j.originalAmount,
            j.ipfsCID,
            j.submission,
            j.deadline,
            j.status
        );
    }

    function isDeadlinePassed(uint256 jobId) external view returns (bool) {
        Job storage j = jobs[jobId];
        require(j.client != address(0), "Job does not exist");
        return block.timestamp > j.deadline;
    }

    function getJobMetadata(uint256 jobId) external view returns (string memory) {
        Job storage j = jobs[jobId];
        require(j.client != address(0), "Job does not exist");
        return j.ipfsCID;
    }
}
