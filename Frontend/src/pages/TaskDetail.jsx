// src/pages/TaskDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mockTasksJson from "../data/mockTasks.json";

/*
  TaskDetail:
  - loads tasks from mock JSON into local state
  - finds the task by id
  - determines role based on connected wallet address
  - implements mockAccept, mockSubmit, mockApprove that update local state
  - optionally uses an upload function (uploadToIPFS) if provided
*/

async function getConnectedAddress() {
  try {
    if (!window.ethereum) return null;
    // prefer selectedAddress, otherwise request accounts non-intrusively
    const addr = window.ethereum.selectedAddress;
    if (addr) return addr;
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    return accounts && accounts.length ? accounts[0] : null;
  } catch (e) {
    console.error("getConnectedAddress error", e);
    return null;
  }
}

const TaskDetail = ({ uploadToIPFS }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // load mock tasks into state so we can mutate locally (no editing of the JSON file)
  const [tasks, setTasks] = useState(() => JSON.parse(JSON.stringify(mockTasksJson)));
  const [task, setTask] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileToSubmit, setFileToSubmit] = useState(null);

  useEffect(() => {
    async function init() {
      const addr = await getConnectedAddress();
      if (addr) setUserAddress(addr);
      // find the task by id (ids in mock are strings)
      const t = tasks.find(t => String(t.id) === String(id));
      setTask(t || null);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tasks]);

  if (!task) return <div style={{ padding: 20 }}><h2>Task not found</h2><button onClick={() => navigate("/")}>Back</button></div>;

  // role logic
  const isClient = userAddress && userAddress.toLowerCase() === String(task.client).toLowerCase();
  const isDeveloper = userAddress && task.developer && userAddress.toLowerCase() === String(task.developer).toLowerCase();
  const isOpen = task.status === "open";
  const isAccepted = task.status === "accepted";
  const isSubmitted = task.status === "submitted";
  const isCompleted = task.status === "completed";

  // helper to update a task by id
  const updateTask = (updater) => {
    setTasks(prev => {
      const copy = prev.map(t => (String(t.id) === String(task.id) ? { ...t, ...updater } : t));
      const newTask = copy.find(t => String(t.id) === String(task.id));
      setTask(newTask);
      return copy;
    });
  };

  // mock accept: set developer = userAddress, status -> accepted
  const mockAccept = () => {
    if (!userAddress) {
      alert("Connect your wallet to accept the task.");
      return;
    }
    if (!isOpen) {
      alert("Task not open.");
      return;
    }
    updateTask({ developer: userAddress, status: "accepted" });
  };

  // mock submit: either upload fileToIPFS (if util provided), otherwise simulate CID
  const mockSubmit = async () => {
    if (!userAddress) {
      alert("Connect your wallet to submit work.");
      return;
    }
    if (!isAccepted || !isDeveloper) {
      alert("You are not assigned to submit for this task.");
      return;
    }
    setSubmitting(true);
    try {
      let cid = null;
      if (uploadToIPFS && fileToSubmit) {
        // uploadToIPFS should be an async function that returns a string CID (without ipfs:// prefix)
        cid = await uploadToIPFS(fileToSubmit);
      } else {
        // simulate a CID for mocks
        cid = `bafkrei-mockcid-${Math.random().toString(36).slice(2, 10)}`;
      }
      // attach submissionCID and set status
      updateTask({ submissionCID: `ipfs://${cid}`, status: "submitted" });
    } catch (e) {
      console.error("submit error", e);
      alert("Submission failed (mock). See console.");
    } finally {
      setSubmitting(false);
    }
  };

  // mock approve: client approves -> status completed
  const mockApprove = () => {
    if (!userAddress) {
      alert("Connect your wallet to approve.");
      return;
    }
    if (!isClient) {
      alert("Only the client can approve work.");
      return;
    }
    if (!isSubmitted) {
      alert("No submission to approve.");
      return;
    }
    updateTask({ status: "completed" });
    alert("Payment released (mock).");
  };

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>Back</button>

      <h1>{task.title}</h1>
      <p>{task.description}</p>

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <p><strong>Price:</strong> {task.price}</p>
        <p><strong>Deadline:</strong> {task.deadline}</p>
        <p><strong>Status:</strong> {task.status}</p>
        <p><strong>Client:</strong> {task.client}</p>
        <p><strong>Developer:</strong> {task.developer ?? "None"}</p>
        <p><strong>Metadata CID:</strong> {task.metadataCID}</p>
        <p><strong>Submission CID:</strong> {task.submissionCID ?? "None"}</p>
      </div>

      <div style={{ marginTop: 16 }}>
        {/* Accept button - shown to anyone if open (but ideally only devs) */}
        {isOpen && (
          <div style={{ marginBottom: 8 }}>
            <button onClick={mockAccept}>Accept Task</button>
            <span style={{ marginLeft: 8 }}>You will become the developer (mock).</span>
          </div>
        )}

        {/* Submit work - shown to the assigned developer */}
        {isAccepted && isDeveloper && (
          <div style={{ marginBottom: 8 }}>
            <input
              type="file"
              onChange={(e) => setFileToSubmit(e.target.files && e.target.files[0])}
            />
            <button disabled={submitting} onClick={mockSubmit} style={{ marginLeft: 8 }}>
              {submitting ? "Submitting..." : "Submit Work"}
            </button>
            <div style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
              {fileToSubmit ? `Chosen file: ${fileToSubmit.name}` : "Choose a file (optional)."}
            </div>
          </div>
        )}

        {/* Approve - shown to the client when submission exists */}
        {isSubmitted && isClient && (
          <div style={{ marginTop: 12 }}>
            <button onClick={mockApprove}>Approve & Release Payment</button>
          </div>
        )}

        {/* If completed show badge */}
        {isCompleted && (
          <div style={{ marginTop: 12, color: "green" }}>
            <strong>Task completed — payment released (mock)</strong>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <small>Connected address: {userAddress ?? "Not connected"}</small>
      </div>
    </div>
  );
};

export default TaskDetail;
