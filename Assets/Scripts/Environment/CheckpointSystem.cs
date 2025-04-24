using UnityEngine;
using System.Collections.Generic;

public class CheckpointSystem : MonoBehaviour
{
    [System.Serializable]
    public class Checkpoint
    {
        public Transform transform;
        public bool isStartFinishLine;
    }
    
    [Header("Checkpoints")]
    public List<Checkpoint> checkpoints = new List<Checkpoint>();
    
    [Header("Settings")]
    public float checkpointRadius = 10f;
    public LayerMask carLayer;
    
    private Dictionary<CarController, int> carCheckpointIndices = new Dictionary<CarController, int>();
    private Dictionary<CarController, int> carLapCounts = new Dictionary<CarController, int>();
    private Dictionary<CarController, float> carLapTimes = new Dictionary<CarController, float>();
    private Dictionary<CarController, float> carBestLapTimes = new Dictionary<CarController, float>();
    
    private void Start()
    {
        // Initialize dictionaries for all cars
        CarController[] cars = FindObjectsOfType<CarController>();
        foreach (var car in cars)
        {
            carCheckpointIndices[car] = 0;
            carLapCounts[car] = 0;
            carLapTimes[car] = 0f;
            carBestLapTimes[car] = float.MaxValue;
        }
    }
    
    private void Update()
    {
        // Check each car against checkpoints
        foreach (var car in carCheckpointIndices.Keys)
        {
            int currentCheckpoint = carCheckpointIndices[car];
            Checkpoint checkpoint = checkpoints[currentCheckpoint];
            
            // Check if car is near checkpoint
            if (Vector3.Distance(car.transform.position, checkpoint.transform.position) < checkpointRadius)
            {
                // If this is the start/finish line
                if (checkpoint.isStartFinishLine)
                {
                    // If we've completed all checkpoints, it's a new lap
                    if (currentCheckpoint == checkpoints.Count - 1)
                    {
                        carLapCounts[car]++;
                        
                        // Update lap time
                        float currentTime = Time.time;
                        float lapTime = currentTime - carLapTimes[car];
                        carLapTimes[car] = currentTime;
                        
                        // Update best lap time
                        if (lapTime < carBestLapTimes[car])
                        {
                            carBestLapTimes[car] = lapTime;
                        }
                        
                        // Check if race is complete
                        if (carLapCounts[car] >= GameManager.Instance.totalLaps)
                        {
                            GameManager.Instance.EndRace();
                        }
                    }
                }
                
                // Move to next checkpoint
                carCheckpointIndices[car] = (currentCheckpoint + 1) % checkpoints.Count;
            }
        }
    }
    
    public int GetLapCount(CarController car)
    {
        return carLapCounts.ContainsKey(car) ? carLapCounts[car] : 0;
    }
    
    public float GetBestLapTime(CarController car)
    {
        return carBestLapTimes.ContainsKey(car) ? carBestLapTimes[car] : float.MaxValue;
    }
    
    private void OnDrawGizmos()
    {
        // Draw checkpoint spheres
        foreach (var checkpoint in checkpoints)
        {
            if (checkpoint.transform != null)
            {
                Gizmos.color = checkpoint.isStartFinishLine ? Color.green : Color.yellow;
                Gizmos.DrawWireSphere(checkpoint.transform.position, checkpointRadius);
            }
        }
    }
} 