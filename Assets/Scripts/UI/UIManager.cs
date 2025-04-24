using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class UIManager : MonoBehaviour
{
    public static UIManager Instance { get; private set; }
    
    [Header("Main Menu")]
    public GameObject mainMenuPanel;
    public Button startButton;
    public Button garageButton;
    public Button settingsButton;
    
    [Header("HUD")]
    public GameObject hudPanel;
    public TextMeshProUGUI speedText;
    public TextMeshProUGUI lapText;
    public TextMeshProUGUI positionText;
    public TextMeshProUGUI currencyText;
    
    [Header("Pause Menu")]
    public GameObject pausePanel;
    public Button resumeButton;
    public Button restartButton;
    public Button quitButton;
    
    [Header("Race Results")]
    public GameObject resultsPanel;
    public TextMeshProUGUI finalPositionText;
    public TextMeshProUGUI finalTimeText;
    public TextMeshProUGUI rewardText;
    public Button nextRaceButton;
    
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
        SetupButtonListeners();
        UpdateCurrencyDisplay();
    }
    
    private void SetupButtonListeners()
    {
        // Main Menu
        startButton.onClick.AddListener(() => GameManager.Instance.LoadScene("RaceTrack"));
        garageButton.onClick.AddListener(() => GameManager.Instance.LoadScene("Garage"));
        settingsButton.onClick.AddListener(ShowSettings);
        
        // Pause Menu
        resumeButton.onClick.AddListener(ResumeGame);
        restartButton.onClick.AddListener(() => GameManager.Instance.LoadScene(SceneManager.GetActiveScene().name));
        quitButton.onClick.AddListener(() => GameManager.Instance.LoadScene("MainMenu"));
        
        // Race Results
        nextRaceButton.onClick.AddListener(() => GameManager.Instance.LoadScene("RaceTrack"));
    }
    
    public void UpdateSpeedDisplay(float speed)
    {
        speedText.text = $"Speed: {speed:F0} km/h";
    }
    
    public void UpdateLapDisplay(int currentLap, int totalLaps)
    {
        lapText.text = $"Lap: {currentLap}/{totalLaps}";
    }
    
    public void UpdatePositionDisplay(int position)
    {
        positionText.text = $"Position: {position}";
    }
    
    public void UpdateCurrencyDisplay()
    {
        currencyText.text = $"Credits: {GameManager.Instance.currentCurrency}";
    }
    
    public void ShowMainMenu()
    {
        mainMenuPanel.SetActive(true);
        hudPanel.SetActive(false);
        pausePanel.SetActive(false);
        resultsPanel.SetActive(false);
    }
    
    public void ShowHUD()
    {
        mainMenuPanel.SetActive(false);
        hudPanel.SetActive(true);
        pausePanel.SetActive(false);
        resultsPanel.SetActive(false);
    }
    
    public void ShowPauseMenu()
    {
        pausePanel.SetActive(true);
        Time.timeScale = 0f;
    }
    
    public void ResumeGame()
    {
        pausePanel.SetActive(false);
        Time.timeScale = 1f;
    }
    
    public void ShowResults(int position, float time, int reward)
    {
        resultsPanel.SetActive(true);
        finalPositionText.text = $"Final Position: {position}";
        finalTimeText.text = $"Time: {time:F2}";
        rewardText.text = $"Reward: {reward} credits";
        
        GameManager.Instance.AddCurrency(reward);
        UpdateCurrencyDisplay();
    }
    
    private void ShowSettings()
    {
        // Implement settings menu
    }
} 