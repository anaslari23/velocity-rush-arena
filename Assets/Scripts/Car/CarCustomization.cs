using UnityEngine;
using System;

[Serializable]
public class CarStats
{
    public float enginePower = 1f;
    public float handling = 1f;
    public float braking = 1f;
    public float topSpeed = 1f;
    public float acceleration = 1f;
}

public class CarCustomization : MonoBehaviour
{
    [Header("Car Parts")]
    public GameObject[] bodyParts;
    public GameObject[] wheelParts;
    public GameObject[] spoilerParts;
    
    [Header("Upgrade Levels")]
    public int engineLevel = 0;
    public int handlingLevel = 0;
    public int brakeLevel = 0;
    
    [Header("Upgrade Costs")]
    public int[] engineUpgradeCosts = { 500, 1000, 2000 };
    public int[] handlingUpgradeCosts = { 400, 800, 1600 };
    public int[] brakeUpgradeCosts = { 300, 600, 1200 };
    
    [Header("Upgrade Multipliers")]
    public float[] engineUpgrades = { 1f, 1.2f, 1.4f, 1.6f };
    public float[] handlingUpgrades = { 1f, 1.15f, 1.3f, 1.45f };
    public float[] brakeUpgrades = { 1f, 1.1f, 1.2f, 1.3f };
    
    private CarStats baseStats;
    private CarStats currentStats;
    private Material carMaterial;
    private Color currentColor;
    
    private void Start()
    {
        InitializeStats();
        LoadCustomization();
    }
    
    private void InitializeStats()
    {
        baseStats = new CarStats
        {
            enginePower = 1f,
            handling = 1f,
            braking = 1f,
            topSpeed = 200f,
            acceleration = 10f
        };
        
        currentStats = new CarStats();
        UpdateStats();
    }
    
    private void UpdateStats()
    {
        currentStats.enginePower = baseStats.enginePower * engineUpgrades[engineLevel];
        currentStats.handling = baseStats.handling * handlingUpgrades[handlingLevel];
        currentStats.braking = baseStats.braking * brakeUpgrades[brakeLevel];
        currentStats.topSpeed = baseStats.topSpeed * engineUpgrades[engineLevel];
        currentStats.acceleration = baseStats.acceleration * engineUpgrades[engineLevel];
    }
    
    public void SetPartVariant(GameObject part, int variantIndex)
    {
        if (part == null) return;
        
        // Deactivate all variants
        foreach (Transform child in part.transform)
        {
            child.gameObject.SetActive(false);
        }
        
        // Activate selected variant
        if (variantIndex < part.transform.childCount)
        {
            part.transform.GetChild(variantIndex).gameObject.SetActive(true);
        }
    }
    
    public void ApplyColor(Color color)
    {
        currentColor = color;
        if (carMaterial == null)
        {
            carMaterial = GetComponentInChildren<Renderer>().material;
        }
        carMaterial.color = color;
    }
    
    public void UpgradeEngine()
    {
        if (engineLevel < engineUpgrades.Length - 1)
        {
            engineLevel++;
            UpdateStats();
        }
    }
    
    public void UpgradeHandling()
    {
        if (handlingLevel < handlingUpgrades.Length - 1)
        {
            handlingLevel++;
            UpdateStats();
        }
    }
    
    public void UpgradeBrakes()
    {
        if (brakeLevel < brakeUpgrades.Length - 1)
        {
            brakeLevel++;
            UpdateStats();
        }
    }
    
    public CarStats GetCurrentStats()
    {
        return currentStats;
    }
    
    public void SaveCustomization()
    {
        PlayerPrefs.SetInt("EngineLevel", engineLevel);
        PlayerPrefs.SetInt("HandlingLevel", handlingLevel);
        PlayerPrefs.SetInt("BrakeLevel", brakeLevel);
        PlayerPrefs.SetFloat("CarColorR", currentColor.r);
        PlayerPrefs.SetFloat("CarColorG", currentColor.g);
        PlayerPrefs.SetFloat("CarColorB", currentColor.b);
        PlayerPrefs.Save();
    }
    
    public void LoadCustomization()
    {
        engineLevel = PlayerPrefs.GetInt("EngineLevel", 0);
        handlingLevel = PlayerPrefs.GetInt("HandlingLevel", 0);
        brakeLevel = PlayerPrefs.GetInt("BrakeLevel", 0);
        
        Color savedColor = new Color(
            PlayerPrefs.GetFloat("CarColorR", 1f),
            PlayerPrefs.GetFloat("CarColorG", 1f),
            PlayerPrefs.GetFloat("CarColorB", 1f)
        );
        
        ApplyColor(savedColor);
        UpdateStats();
    }
} 