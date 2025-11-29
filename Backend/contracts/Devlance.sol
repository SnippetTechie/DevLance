// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DevLance {
    enum Status { Open, InProgress, Submitted, Completed, Cancelled }

    struct Job {
        uint256 id;              
        address payable client;  
        address payable developer;
        uint256 amount;          
        uint256 originalAmount;  
        string description;      
        string submission;       
        Status status;           
    }

    uint256 public nextJobId;
    mapping(uint256 => Job) public jobs;

    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        uint256 amount,
        string description
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

    function createJob(string calldata description)
        external
        payable
        returns (uint256 jobId)
    {
        require(msg.value > 0, "Escrow must be > 0");

        jobId = nextJobId++;
        Job storage j = jobs[jobId];

        j.id = jobId;
        j.client = payable(msg.sender);
        j.developer = payable(address(0));
        j.amount = msg.value;
        j.originalAmount = msg.value;
        j.description = description;
        j.submission = "";
        j.status = Status.Open;

        emit JobCreated(jobId, msg.sender, msg.value, description);
    }

    function acceptJob(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(j.client != address(0), "Job does not exist");
        require(j.status == Status.Open, "Job not open");
        require(j.developer == address(0), "Already accepted");

        j.developer = payable(msg.sender);
        j.status = Status.InProgress;

        emit JobAccepted(jobId, msg.sender);
    }

    function submitWork(uint256 jobId, string calldata submission) external {
        Job storage j = jobs[jobId];
        require(j.client != address(0), "Job does not exist");
        require(msg.sender == j.developer, "Only developer");
        require(j.status == Status.InProgress, "Job not in progress");

        j.submission = submission;
        j.status = Status.Submitted;

        emit WorkSubmitted(jobId, submission);
    }

    function releaseFullPayment(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(j.client != address(0), "Job does not exist");
        require(msg.sender == j.client, "Only client");
        require(j.status == Status.Submitted, "Job not submitted");
        require(j.amount > 0, "No funds in escrow");
        require(j.developer != address(0), "No developer");

        uint256 payout = j.amount;

        j.amount = 0;
        j.status = Status.Completed;

        (bool sent, ) = j.developer.call{value: payout}("");
        require(sent, "Transfer failed");

        emit FullPaymentReleased(jobId, j.developer, payout);
    }

    function releasePartialPayment(uint256 jobId, uint256 amountToDeveloper) external {
        Job storage j = jobs[jobId];
        require(j.client != address(0), "Job does not exist");
        require(msg.sender == j.client, "Only client");
        require(j.status == Status.Submitted, "Job not submitted");
        require(j.amount > 0, "No funds in escrow");
        require(j.developer != address(0), "No developer");
        require(amountToDeveloper > 0, "Must pay > 0");
        require(amountToDeveloper < j.amount, "Use full release for 100%");

        uint256 total = j.amount;
        uint256 refund = total - amountToDeveloper;

        j.amount = 0;
        j.status = Status.Cancelled;


        (bool sentDev, ) = j.developer.call{value: amountToDeveloper}("");
        require(sentDev, "Dev transfer failed");

        (bool sentClient, ) = j.client.call{value: refund}("");
        require(sentClient, "Client refund failed");

        emit PartialPaymentReleased(jobId, j.developer, amountToDeveloper, refund);
    }

    function cancelJob(uint256 jobId) external {
        Job storage j = jobs[jobId];
        require(j.client != address(0), "Job does not exist");
        require(msg.sender == j.client, "Only client");
        require(j.status == Status.Open, "Can cancel only when open");
        require(j.amount > 0, "No funds in escrow");

        uint256 refund = j.amount;

        // Effects
        j.amount = 0;
        j.status = Status.Cancelled;

        // Refund escrow
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
            uint256 originalAmount,
            string memory description,
            string memory submission,
            Status status
        )
    {
        Job storage j = jobs[jobId];
        return (
            j.id,
            j.client,
            j.developer,
            j.amount,
            j.originalAmount,
            j.description,
            j.submission,
            j.status
        );
    }
}