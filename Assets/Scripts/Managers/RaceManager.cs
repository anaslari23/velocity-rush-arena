using UnityEngine;
using System.Collections.Generic;
using System.Linq;

public class RaceManager : MonoBehaviour
{
    public static RaceManager Instance { get; private set; }
    
    [Header("Race Settings")]
    public int totalLaps = 3;
    public float[] positionRewards = { 1000, 750, 500, 250, 100 };
    
    [Header("Checkpoints")]
    public Transform[] checkpoints;
    public Transform finishLine;
    
    private List<CarController> racers = new List<CarController>();
    private Dictionary<CarController, int> lapCounts = new Dictionary<CarController, int>();
    private Dictionary<CarController, float> raceTimes = new Dictionary<CarController, float>();
    private bool raceStarted;
    private bool raceFinished;
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    private void Start()
    {
        FindAllRacers();
        InitializeRace();
    }
    
    private void Update()
    {
        if (raceStarted && !raceFinished)
        {
            UpdateRaceTimes();
            UpdatePositions();
        }
    }
    
    private void FindAllRacers()
    {
        racers = FindObjectsOfType<CarController>().ToList();
        foreach (var racer in racers)
        {
            lapCounts[racer] = 0;
            raceTimes[racer] = 0f;
        }
    }
    
    private void InitializeRace()
    {
        raceStarted = false;
        raceFinished = false;
        UIManager.Instance.ShowHUD();
    }
    
    public void StartRace()
    {
        raceStarted = true;
        raceFinished = false;
    }
    
    private void UpdateRaceTimes()
    {
        foreach (var racer in racers)
        {
            if (!raceTimes.ContainsKey(racer))
            {
                raceTimes[racer] = 0f;
            }
            raceTimes[racer] += Time.deltaTime;
        }
    }
    
    private void UpdatePositions()
    {
        // Sort racers by lap count and race time
        var sortedRacers = racers.OrderByDescending(r => lapCounts[r])
                                .ThenBy(r => raceTimes[r])
                                .ToList();
        
        // Update UI for player
        var playerRacer = racers.Find(r => !r.isAI);
        if (playerRacer != null)
        {
            int playerPosition = sortedRacers.IndexOf(playerRacer) + 1;
            UIManager.Instance.UpdatePositionDisplay(playerPosition);
            UIManager.Instance.UpdateLapDisplay(lapCounts[playerRacer], totalLaps);
        }
    }
    
    public void OnCheckpointPassed(CarController racer, Transform checkpoint)
    {
        if (!raceStarted || raceFinished) return;
        
        // Check if this is the finish line
        if (checkpoint == finishLine)
        {
            lapCounts[racer]++;
            
            // Check if race is finished
            if (lapCounts[racer] >= totalLaps)
            {
                FinishRace(racer);
            }
        }
    }
    
    private void FinishRace(CarController winner)
    {
        raceFinished = true;
        
        // Sort final positions
        var finalPositions = racers.OrderByDescending(r => lapCounts[r])
                                  .ThenBy(r => raceTimes[r])
                                  .ToList();
        
        // Find player's position
        var playerRacer = racers.Find(r => !r.isAI);
        if (playerRacer != null)
        {
            int playerPosition = finalPositions.IndexOf(playerRacer) + 1;
            float playerTime = raceTimes[playerRacer];
            int reward = positionRewards[Mathf.Min(playerPosition - 1, positionRewards.Length - 1)];
            
            UIManager.Instance.ShowResults(playerPosition, playerTime, reward);
        }
    }
} 