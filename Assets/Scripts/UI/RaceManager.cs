using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;
using System.Collections;

public class RaceManager : MonoBehaviour
{
    public static RaceManager Instance { get; private set; }
    
    [Header("Race Settings")]
    public int numberOfLaps = 3;
    public float raceTimeLimit = 300f; // 5 minutes
    public Transform[] startingPositions;
    public Transform[] checkpoints;
    
    [Header("UI Elements")]
    public TextMeshProUGUI positionText;
    public TextMeshProUGUI lapText;
    public TextMeshProUGUI timeText;
    public TextMeshProUGUI speedText;
    public Slider boostSlider;
    public GameObject raceHUD;
    public GameObject pauseMenu;
    public GameObject resultsPanel;
    public TextMeshProUGUI[] resultTexts;
    
    [Header("Cars")]
    public GameObject playerCarPrefab;
    public GameObject[] aiCarPrefabs;
    public int numberOfAICars = 5;
    
    private List<CarController> cars = new List<CarController>();
    private CarController playerCar;
    private bool isRaceActive = false;
    private float currentRaceTime = 0f;
    private int currentLap = 0;
    private int currentCheckpoint = 0;
    
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
        InitializeRace();
        SoundManager.Instance.PlayMusic(SoundManager.Instance.raceMusic);
    }
    
    private void Update()
    {
        if (isRaceActive)
        {
            UpdateRaceTime();
            UpdateHUD();
            CheckRaceCompletion();
        }
        
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            TogglePauseMenu();
        }
    }
    
    private void InitializeRace()
    {
        // Spawn player car
        SpawnPlayerCar();
        
        // Spawn AI cars
        SpawnAICars();
        
        // Initialize HUD
        raceHUD.SetActive(true);
        pauseMenu.SetActive(false);
        resultsPanel.SetActive(false);
        
        // Start countdown
        StartCoroutine(StartRaceCountdown());
    }
    
    private void SpawnPlayerCar()
    {
        if (playerCarPrefab != null && startingPositions.Length > 0)
        {
            GameObject playerCarObj = Instantiate(playerCarPrefab, startingPositions[0].position, startingPositions[0].rotation);
            playerCar = playerCarObj.GetComponent<CarController>();
            cars.Add(playerCar);
        }
    }
    
    private void SpawnAICars()
    {
        for (int i = 0; i < numberOfAICars && i < startingPositions.Length - 1; i++)
        {
            GameObject aiCarPrefab = aiCarPrefabs[Random.Range(0, aiCarPrefabs.Length)];
            GameObject aiCarObj = Instantiate(aiCarPrefab, startingPositions[i + 1].position, startingPositions[i + 1].rotation);
            AIController aiController = aiCarObj.GetComponent<AIController>();
            aiController.Initialize(checkpoints);
            cars.Add(aiCarObj.GetComponent<CarController>());
        }
    }
    
    private IEnumerator StartRaceCountdown()
    {
        CountdownManager.Instance.StartCountdown();
        yield return new WaitForSeconds(4f); // 3 seconds countdown + 1 second GO!
        StartRace();
    }
    
    private void StartRace()
    {
        isRaceActive = true;
        currentRaceTime = 0f;
        currentLap = 0;
        currentCheckpoint = 0;
        
        foreach (CarController car in cars)
        {
            car.enabled = true;
        }
    }
    
    private void UpdateRaceTime()
    {
        currentRaceTime += Time.deltaTime;
    }
    
    private void UpdateHUD()
    {
        if (playerCar != null)
        {
            // Update position
            int position = GetCarPosition(playerCar);
            positionText.text = $"Position: {position}/{cars.Count}";
            
            // Update lap
            lapText.text = $"Lap: {currentLap + 1}/{numberOfLaps}";
            
            // Update time
            int minutes = Mathf.FloatToInt(currentRaceTime) / 60;
            int seconds = Mathf.FloatToInt(currentRaceTime) % 60;
            timeText.text = $"Time: {minutes:00}:{seconds:00}";
            
            // Update speed
            speedText.text = $"Speed: {playerCar.GetSpeed():F0} km/h";
            
            // Update boost
            if (playerCar.boostSystem != null)
            {
                boostSlider.value = playerCar.boostSystem.currentBoost / playerCar.boostSystem.maxBoost;
            }
        }
    }
    
    private int GetCarPosition(CarController car)
    {
        List<CarController> sortedCars = new List<CarController>(cars);
        sortedCars.Sort((a, b) => b.GetRaceProgress().CompareTo(a.GetRaceProgress()));
        return sortedCars.IndexOf(car) + 1;
    }
    
    private void CheckRaceCompletion()
    {
        if (playerCar != null && currentLap >= numberOfLaps)
        {
            EndRace();
        }
    }
    
    private void EndRace()
    {
        isRaceActive = false;
        
        // Sort cars by race progress
        cars.Sort((a, b) => b.GetRaceProgress().CompareTo(a.GetRaceProgress()));
        
        // Show results
        ShowResults();
        
        // Play race end sound
        SoundManager.Instance.PlaySFX("RaceEnd");
    }
    
    private void ShowResults()
    {
        raceHUD.SetActive(false);
        resultsPanel.SetActive(true);
        
        for (int i = 0; i < resultTexts.Length && i < cars.Count; i++)
        {
            resultTexts[i].text = $"{i + 1}. {cars[i].name}";
        }
    }
    
    public void OnCheckpointReached(CarController car, int checkpointIndex)
    {
        if (car == playerCar)
        {
            if (checkpointIndex == currentCheckpoint)
            {
                currentCheckpoint++;
                if (currentCheckpoint >= checkpoints.Length)
                {
                    currentCheckpoint = 0;
                    currentLap++;
                    SoundManager.Instance.PlaySFX("LapComplete");
                }
            }
        }
    }
    
    private void TogglePauseMenu()
    {
        bool isPaused = !pauseMenu.activeSelf;
        pauseMenu.SetActive(isPaused);
        Time.timeScale = isPaused ? 0f : 1f;
        
        if (isPaused)
        {
            SoundManager.Instance.PauseMusic();
        }
        else
        {
            SoundManager.Instance.ResumeMusic();
        }
    }
    
    public void ResumeRace()
    {
        TogglePauseMenu();
    }
    
    public void RestartRace()
    {
        Time.timeScale = 1f;
        GameManager.Instance.LoadScene("RaceTrack");
    }
    
    public void ReturnToMenu()
    {
        Time.timeScale = 1f;
        GameManager.Instance.LoadScene("MainMenu");
    }
} 