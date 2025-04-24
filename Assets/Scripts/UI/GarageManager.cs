using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;

public class GarageManager : MonoBehaviour
{
    [Header("Car Display")]
    public Transform carDisplayPlatform;
    public float rotationSpeed = 10f;
    public Camera garageCamera;
    
    [Header("Customization UI")]
    public GameObject customizationPanel;
    public Button[] bodyPartButtons;
    public Button[] wheelPartButtons;
    public Button[] spoilerPartButtons;
    public Button[] colorButtons;
    public Button[] upgradeButtons;
    
    [Header("Stats Display")]
    public TextMeshProUGUI speedStat;
    public TextMeshProUGUI handlingStat;
    public TextMeshProUGUI accelerationStat;
    public TextMeshProUGUI brakeStat;
    public Slider[] statSliders;
    
    [Header("Currency")]
    public TextMeshProUGUI currencyText;
    public int currentCurrency = 1000;
    
    private CarCustomization currentCar;
    private List<GameObject> displayedCars = new List<GameObject>();
    
    private void Start()
    {
        InitializeGarage();
        UpdateCurrencyDisplay();
        SoundManager.Instance.PlayMusic(SoundManager.Instance.garageMusic);
    }
    
    private void Update()
    {
        // Rotate the car display
        if (carDisplayPlatform != null && currentCar != null)
        {
            carDisplayPlatform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);
        }
    }
    
    private void InitializeGarage()
    {
        // Load saved car
        LoadCurrentCar();
        
        // Set up button listeners
        SetupButtonListeners();
        
        // Update stats display
        UpdateStatsDisplay();
    }
    
    private void LoadCurrentCar()
    {
        // Instantiate the current car
        GameObject carPrefab = Resources.Load<GameObject>("Cars/PlayerCar");
        if (carPrefab != null)
        {
            GameObject carInstance = Instantiate(carPrefab, carDisplayPlatform);
            currentCar = carInstance.GetComponent<CarCustomization>();
            displayedCars.Add(carInstance);
            
            // Load saved customization
            currentCar.LoadCustomization();
        }
    }
    
    private void SetupButtonListeners()
    {
        // Body part buttons
        for (int i = 0; i < bodyPartButtons.Length; i++)
        {
            int index = i;
            bodyPartButtons[i].onClick.AddListener(() => {
                SoundManager.Instance.PlaySFX("ButtonClick");
                ChangeBodyPart(index);
            });
        }
        
        // Wheel part buttons
        for (int i = 0; i < wheelPartButtons.Length; i++)
        {
            int index = i;
            wheelPartButtons[i].onClick.AddListener(() => {
                SoundManager.Instance.PlaySFX("ButtonClick");
                ChangeWheelPart(index);
            });
        }
        
        // Spoiler part buttons
        for (int i = 0; i < spoilerPartButtons.Length; i++)
        {
            int index = i;
            spoilerPartButtons[i].onClick.AddListener(() => {
                SoundManager.Instance.PlaySFX("ButtonClick");
                ChangeSpoilerPart(index);
            });
        }
        
        // Color buttons
        for (int i = 0; i < colorButtons.Length; i++)
        {
            int index = i;
            colorButtons[i].onClick.AddListener(() => {
                SoundManager.Instance.PlaySFX("ButtonClick");
                ChangeColor(index);
            });
        }
        
        // Upgrade buttons
        for (int i = 0; i < upgradeButtons.Length; i++)
        {
            int index = i;
            upgradeButtons[i].onClick.AddListener(() => {
                SoundManager.Instance.PlaySFX("ButtonClick");
                UpgradePart(index);
            });
        }
    }
    
    private void ChangeBodyPart(int variantIndex)
    {
        if (currentCar != null && currentCar.bodyParts.Length > 0)
        {
            currentCar.SetPartVariant(currentCar.bodyParts[0], variantIndex);
            UpdateStatsDisplay();
        }
    }
    
    private void ChangeWheelPart(int variantIndex)
    {
        if (currentCar != null && currentCar.wheelParts.Length > 0)
        {
            currentCar.SetPartVariant(currentCar.wheelParts[0], variantIndex);
            UpdateStatsDisplay();
        }
    }
    
    private void ChangeSpoilerPart(int variantIndex)
    {
        if (currentCar != null && currentCar.spoilerParts.Length > 0)
        {
            currentCar.SetPartVariant(currentCar.spoilerParts[0], variantIndex);
            UpdateStatsDisplay();
        }
    }
    
    private void ChangeColor(int colorIndex)
    {
        if (currentCar != null)
        {
            Color[] availableColors = {
                Color.red,
                Color.blue,
                Color.green,
                Color.yellow,
                Color.black,
                Color.white
            };
            
            if (colorIndex < availableColors.Length)
            {
                currentCar.ApplyColor(availableColors[colorIndex]);
            }
        }
    }
    
    private void UpgradePart(int upgradeIndex)
    {
        if (currentCar != null)
        {
            int cost = 100 * (upgradeIndex + 1);
            if (currentCurrency >= cost)
            {
                switch (upgradeIndex)
                {
                    case 0: // Engine
                        currentCar.UpgradeEngine();
                        break;
                    case 1: // Handling
                        currentCar.UpgradeHandling();
                        break;
                    case 2: // Brakes
                        currentCar.UpgradeBrakes();
                        break;
                }
                
                currentCurrency -= cost;
                UpdateCurrencyDisplay();
                UpdateStatsDisplay();
                currentCar.SaveCustomization();
            }
        }
    }
    
    private void UpdateStatsDisplay()
    {
        if (currentCar == null) return;
        
        CarStats stats = currentCar.GetCurrentStats();
        
        // Update text displays
        speedStat.text = $"Speed: {stats.topSpeed:F0} km/h";
        handlingStat.text = $"Handling: {stats.handling:F1}x";
        accelerationStat.text = $"Acceleration: {stats.acceleration:F1}x";
        brakeStat.text = $"Braking: {stats.braking:F1}x";
        
        // Update sliders
        statSliders[0].value = currentCar.engineLevel / (float)(currentCar.engineUpgrades.Length - 1);
        statSliders[1].value = currentCar.handlingLevel / (float)(currentCar.handlingUpgrades.Length - 1);
        statSliders[2].value = currentCar.brakeLevel / (float)(currentCar.brakeUpgrades.Length - 1);
    }
    
    private void UpdateCurrencyDisplay()
    {
        currencyText.text = $"Credits: {currentCurrency}";
    }
    
    public void SaveAndExit()
    {
        if (currentCar != null)
        {
            currentCar.SaveCustomization();
        }
        GameManager.Instance.LoadScene("MainMenu");
    }
    
    public void StartRace()
    {
        if (currentCar != null)
        {
            currentCar.SaveCustomization();
        }
        GameManager.Instance.LoadScene("RaceTrack");
    }
} 