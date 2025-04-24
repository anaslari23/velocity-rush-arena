using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class UIManager : MonoBehaviour
{
    [Header("Race UI")]
    public TextMeshProUGUI speedText;
    public TextMeshProUGUI lapText;
    public TextMeshProUGUI positionText;
    public TextMeshProUGUI timeText;
    public TextMeshProUGUI countdownText;
    
    [Header("Menus")]
    public GameObject mainMenu;
    public GameObject pauseMenu;
    public GameObject raceEndMenu;
    public GameObject HUD;
    
    [Header("Race End UI")]
    public TextMeshProUGUI finalTimeText;
    public TextMeshProUGUI finalPositionText;
    public TextMeshProUGUI bestLapText;
    
    private CarController playerCar;
    private GameManager gameManager;
    
    private void Start()
    {
        gameManager = GameManager.Instance;
        playerCar = FindObjectOfType<CarController>();
        
        // Initialize UI state
        ShowMainMenu();
        HideHUD();
        HidePauseMenu();
        HideRaceEndMenu();
    }
    
    private void Update()
    {
        if (gameManager.currentGameState == GameManager.GameState.Racing)
        {
            UpdateRaceUI();
        }
    }
    
    private void UpdateRaceUI()
    {
        if (playerCar != null)
        {
            // Update speed
            float speed = playerCar.currentSpeed;
            speedText.text = $"Speed: {Mathf.Round(speed)} km/h";
            
            // Update lap
            lapText.text = $"Lap: {gameManager.currentLap}/{gameManager.totalLaps}";
            
            // Update position (you'll need to implement position tracking)
            positionText.text = "Position: 1st";
            
            // Update time
            timeText.text = FormatTime(gameManager.currentRaceTime);
        }
    }
    
    public void ShowCountdown(int count)
    {
        countdownText.gameObject.SetActive(true);
        countdownText.text = count.ToString();
    }
    
    public void HideCountdown()
    {
        countdownText.gameObject.SetActive(false);
    }
    
    public void ShowMainMenu()
    {
        mainMenu.SetActive(true);
        HideHUD();
        HidePauseMenu();
        HideRaceEndMenu();
    }
    
    public void HideMainMenu()
    {
        mainMenu.SetActive(false);
    }
    
    public void ShowPauseMenu()
    {
        pauseMenu.SetActive(true);
        HideHUD();
    }
    
    public void HidePauseMenu()
    {
        pauseMenu.SetActive(false);
    }
    
    public void ShowRaceEndMenu(float finalTime, int finalPosition, float bestLapTime)
    {
        raceEndMenu.SetActive(true);
        HideHUD();
        
        finalTimeText.text = $"Final Time: {FormatTime(finalTime)}";
        finalPositionText.text = $"Position: {GetPositionText(finalPosition)}";
        bestLapText.text = $"Best Lap: {FormatTime(bestLapTime)}";
    }
    
    public void HideRaceEndMenu()
    {
        raceEndMenu.SetActive(false);
    }
    
    public void ShowHUD()
    {
        HUD.SetActive(true);
    }
    
    public void HideHUD()
    {
        HUD.SetActive(false);
    }
    
    private string FormatTime(float timeInSeconds)
    {
        int minutes = Mathf.FloorToInt(timeInSeconds / 60);
        int seconds = Mathf.FloorToInt(timeInSeconds % 60);
        int milliseconds = Mathf.FloorToInt((timeInSeconds * 1000) % 1000);
        
        return string.Format("{0:00}:{1:00}:{2:000}", minutes, seconds, milliseconds);
    }
    
    private string GetPositionText(int position)
    {
        switch (position)
        {
            case 1: return "1st";
            case 2: return "2nd";
            case 3: return "3rd";
            default: return $"{position}th";
        }
    }
    
    // Button click handlers
    public void OnStartRaceClicked()
    {
        HideMainMenu();
        ShowHUD();
        gameManager.StartRace();
    }
    
    public void OnPauseClicked()
    {
        gameManager.PauseGame();
        ShowPauseMenu();
    }
    
    public void OnResumeClicked()
    {
        gameManager.ResumeGame();
        HidePauseMenu();
        ShowHUD();
    }
    
    public void OnRestartClicked()
    {
        gameManager.LoadScene(SceneManager.GetActiveScene().name);
    }
    
    public void OnMainMenuClicked()
    {
        gameManager.LoadScene("MainMenu");
    }
} 