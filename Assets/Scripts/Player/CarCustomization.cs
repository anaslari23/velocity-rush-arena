using UnityEngine;
using System.Collections.Generic;

public class CarCustomization : MonoBehaviour
{
    [System.Serializable]
    public class CarPart
    {
        public string name;
        public GameObject[] variants;
        public int currentVariant;
    }
    
    [Header("Car Parts")]
    public CarPart[] bodyParts;
    public CarPart[] wheelParts;
    public CarPart[] spoilerParts;
    
    [Header("Performance Parts")]
    public float[] engineUpgrades = { 1f, 1.2f, 1.4f, 1.6f };
    public float[] handlingUpgrades = { 1f, 1.15f, 1.3f, 1.45f };
    public float[] brakeUpgrades = { 1f, 1.1f, 1.2f, 1.3f };
    
    [Header("Current Upgrades")]
    public int engineLevel = 0;
    public int handlingLevel = 0;
    public int brakeLevel = 0;
    
    private CarController carController;
    private Dictionary<string, GameObject> activeParts = new Dictionary<string, GameObject>();
    
    private void Start()
    {
        carController = GetComponent<CarController>();
        InitializeParts();
        ApplyUpgrades();
    }
    
    private void InitializeParts()
    {
        // Initialize all parts with their first variant
        foreach (var part in bodyParts)
        {
            if (part.variants.Length > 0)
            {
                SetPartVariant(part, 0);
            }
        }
        
        foreach (var part in wheelParts)
        {
            if (part.variants.Length > 0)
            {
                SetPartVariant(part, 0);
            }
        }
        
        foreach (var part in spoilerParts)
        {
            if (part.variants.Length > 0)
            {
                SetPartVariant(part, 0);
            }
        }
    }
    
    public void SetPartVariant(CarPart part, int variantIndex)
    {
        if (variantIndex < 0 || variantIndex >= part.variants.Length) return;
        
        // Deactivate current variant
        if (activeParts.ContainsKey(part.name))
        {
            activeParts[part.name].SetActive(false);
        }
        
        // Activate new variant
        part.variants[variantIndex].SetActive(true);
        activeParts[part.name] = part.variants[variantIndex];
        part.currentVariant = variantIndex;
    }
    
    public void UpgradeEngine()
    {
        if (engineLevel < engineUpgrades.Length - 1)
        {
            engineLevel++;
            ApplyUpgrades();
        }
    }
    
    public void UpgradeHandling()
    {
        if (handlingLevel < handlingUpgrades.Length - 1)
        {
            handlingLevel++;
            ApplyUpgrades();
        }
    }
    
    public void UpgradeBrakes()
    {
        if (brakeLevel < brakeUpgrades.Length - 1)
        {
            brakeLevel++;
            ApplyUpgrades();
        }
    }
    
    private void ApplyUpgrades()
    {
        if (carController == null) return;
        
        // Apply engine upgrade
        carController.maxSpeed *= engineUpgrades[engineLevel];
        carController.acceleration *= engineUpgrades[engineLevel];
        
        // Apply handling upgrade
        carController.turnSpeed *= handlingUpgrades[handlingLevel];
        carController.driftFactor = Mathf.Clamp(carController.driftFactor * (1f / handlingUpgrades[handlingLevel]), 0.8f, 0.98f);
        
        // Apply brake upgrade
        carController.deceleration *= brakeUpgrades[brakeLevel];
    }
    
    public void ApplyColor(Color color)
    {
        // Apply color to all body parts
        foreach (var part in bodyParts)
        {
            if (activeParts.ContainsKey(part.name))
            {
                Renderer[] renderers = activeParts[part.name].GetComponentsInChildren<Renderer>();
                foreach (var renderer in renderers)
                {
                    renderer.material.color = color;
                }
            }
        }
    }
    
    public void SaveCustomization()
    {
        // Create a serializable data structure
        CarCustomizationData data = new CarCustomizationData
        {
            bodyVariants = new int[bodyParts.Length],
            wheelVariants = new int[wheelParts.Length],
            spoilerVariants = new int[spoilerParts.Length],
            engineLevel = engineLevel,
            handlingLevel = handlingLevel,
            brakeLevel = brakeLevel
        };
        
        // Save current variants
        for (int i = 0; i < bodyParts.Length; i++)
        {
            data.bodyVariants[i] = bodyParts[i].currentVariant;
        }
        
        for (int i = 0; i < wheelParts.Length; i++)
        {
            data.wheelVariants[i] = wheelParts[i].currentVariant;
        }
        
        for (int i = 0; i < spoilerParts.Length; i++)
        {
            data.spoilerVariants[i] = spoilerParts[i].currentVariant;
        }
        
        // Convert to JSON and save
        string json = JsonUtility.ToJson(data);
        PlayerPrefs.SetString("CarCustomization", json);
        PlayerPrefs.Save();
    }
    
    public void LoadCustomization()
    {
        if (PlayerPrefs.HasKey("CarCustomization"))
        {
            string json = PlayerPrefs.GetString("CarCustomization");
            CarCustomizationData data = JsonUtility.FromJson<CarCustomizationData>(json);
            
            // Load variants
            for (int i = 0; i < bodyParts.Length && i < data.bodyVariants.Length; i++)
            {
                SetPartVariant(bodyParts[i], data.bodyVariants[i]);
            }
            
            for (int i = 0; i < wheelParts.Length && i < data.wheelVariants.Length; i++)
            {
                SetPartVariant(wheelParts[i], data.wheelVariants[i]);
            }
            
            for (int i = 0; i < spoilerParts.Length && i < data.spoilerVariants.Length; i++)
            {
                SetPartVariant(spoilerParts[i], data.spoilerVariants[i]);
            }
            
            // Load upgrades
            engineLevel = data.engineLevel;
            handlingLevel = data.handlingLevel;
            brakeLevel = data.brakeLevel;
            
            ApplyUpgrades();
        }
    }
    
    [System.Serializable]
    private class CarCustomizationData
    {
        public int[] bodyVariants;
        public int[] wheelVariants;
        public int[] spoilerVariants;
        public int engineLevel;
        public int handlingLevel;
        public int brakeLevel;
    }
} 