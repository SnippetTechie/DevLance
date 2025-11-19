import React from "react";
import { Link } from "react-router-dom";

const TaskCard = ({ task }) => {
  return (
    <div style={{
      border: "1px solid #ddd",
      padding: "16px",
      borderRadius: "8px",
      marginBottom: "12px"
    }}>
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <p><strong>Price:</strong> {task.price}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <p><strong>Deadline:</strong> {task.deadline}</p>
      <Link to={`/task/${task.id}`}>
      <button>View Details</button>
      </Link>
    </div>
  );
};

export default TaskCard;
