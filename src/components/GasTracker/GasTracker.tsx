'use client'
import {useEffect} from "react";
import axios from "axios";

const GasTracker = () => {
  useEffect(() => {
    (async () => {
      const data = await axios.get('/api/recommendations')
      console.log(data)
    })()
  }, [])

  return (
    <div>
      <p>hello gas tracker</p>
    </div>
  )
}

export default GasTracker