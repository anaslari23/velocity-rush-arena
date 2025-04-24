using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    
    [Header("Game Settings")]
    public int startingCurrency = 1000;
    public int currentCurrency;
    
    [Header("Car Settings")]
    public GameObject defaultCarPrefab;
    public GameObject currentCar;
    
    public int totalLaps = 3;
    public float raceTimeLimit = 300f;
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeGame();
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    private void InitializeGame()
    {
        currentCurrency = startingCurrency;
    }
    
    public void LoadScene(string sceneName)
    {
        SceneManager.LoadScene(sceneName);
    }
    
    public void AddCurrency(int amount)
    {
        currentCurrency += amount;
        // Update UI if needed
    }
    
    public bool SpendCurrency(int amount)
    {
        if (currentCurrency >= amount)
        {
            currentCurrency -= amount;
            // Update UI if needed
            return true;
        }
        return false;
    }
    
    public void SetCurrentCar(GameObject car)
    {
        currentCar = car;
    }
    
    public void EndRace()
    {
        // Handle race end logic
        LoadScene("MainMenu");
    }
} 