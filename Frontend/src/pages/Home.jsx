import React from 'react'
import mockTasks from "../data/mockTasks.json";
import TaskCard from '../components/TaskCard';

const Home = () => {
  return (
    <>
      <div>
        <h1>Welcom to DevLance</h1>
      </div>
      <div>
        {mockTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </>
  )
}

export default Home
