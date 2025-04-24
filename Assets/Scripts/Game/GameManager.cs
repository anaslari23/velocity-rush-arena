using UnityEngine;
using UnityEngine.SceneManagement;
using System.Collections.Generic;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    
    [Header("Race Settings")]
    public int totalLaps = 3;
    public float countdownTime = 3f;
    
    [Header("Game State")]
    public GameState currentGameState;
    public float currentRaceTime;
    public int currentLap;
    public bool isRaceStarted;
    
    private List<CarController> allCars = new List<CarController>();
    
    public enum GameState
    {
        MainMenu,
        Countdown,
        Racing,
        Paused,
        RaceEnd
    }
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    private void Start()
    {
        InitializeGame();
    }
    
    private void Update()
    {
        if (currentGameState == GameState.Racing)
        {
            currentRaceTime += Time.deltaTime;
        }
    }
    
    private void InitializeGame()
    {
        currentGameState = GameState.MainMenu;
        currentRaceTime = 0f;
        currentLap = 0;
        isRaceStarted = false;
    }
    
    public void StartRace()
    {
        currentGameState = GameState.Countdown;
        StartCoroutine(CountdownToStart());
    }
    
    private System.Collections.IEnumerator CountdownToStart()
    {
        float countdown = countdownTime;
        
        while (countdown > 0)
        {
            // Update UI with countdown
            yield return new WaitForSeconds(1f);
            countdown--;
        }
        
        StartRacing();
    }
    
    private void StartRacing()
    {
        currentGameState = GameState.Racing;
        isRaceStarted = true;
        currentRaceTime = 0f;
        
        // Enable all cars
        foreach (var car in allCars)
        {
            car.enabled = true;
        }
    }
    
    public void EndRace()
    {
        currentGameState = GameState.RaceEnd;
        isRaceStarted = false;
        
        // Disable all cars
        foreach (var car in allCars)
        {
            car.enabled = false;
        }
        
        // Show race results
        ShowRaceResults();
    }
    
    private void ShowRaceResults()
    {
        // Implement race results display
    }
    
    public void RegisterCar(CarController car)
    {
        if (!allCars.Contains(car))
        {
            allCars.Add(car);
        }
    }
    
    public void UnregisterCar(CarController car)
    {
        if (allCars.Contains(car))
        {
            allCars.Remove(car);
        }
    }
    
    public void LoadScene(string sceneName)
    {
        SceneManager.LoadScene(sceneName);
    }
    
    public void PauseGame()
    {
        if (currentGameState == GameState.Racing)
        {
            currentGameState = GameState.Paused;
            Time.timeScale = 0f;
        }
    }
    
    public void ResumeGame()
    {
        if (currentGameState == GameState.Paused)
        {
            currentGameState = GameState.Racing;
            Time.timeScale = 1f;
        }
    }
} 