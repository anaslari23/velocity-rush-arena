using UnityEngine;

public class BoostSystem : MonoBehaviour
{
    [Header("Boost Settings")]
    public float maxBoost = 100f;
    public float boostRegenRate = 10f;
    public float boostDrainRate = 20f;
    public float boostMultiplier = 1.5f;
    
    [Header("Visual Effects")]
    public ParticleSystem boostParticles;
    public TrailRenderer[] boostTrails;
    
    public float currentBoost { get; private set; }
    public bool isBoosting { get; private set; }
    
    private float currentBoostTime = 0f;
    private float currentCooldown = 0f;
    private CarController carController;
    
    private void Start()
    {
        currentBoost = maxBoost;
        carController = GetComponent<CarController>();
    }
    
    private void Update()
    {
        if (isBoosting)
        {
            currentBoost -= boostDrainRate * Time.deltaTime;
            if (currentBoost <= 0f)
            {
                currentBoost = 0f;
                isBoosting = false;
            }
        }
        else
        {
            currentBoost += boostRegenRate * Time.deltaTime;
            if (currentBoost > maxBoost)
            {
                currentBoost = maxBoost;
            }
        }
        
        UpdateVisualEffects();
    }
    
    public void UseBoost()
    {
        if (currentBoost > 0f)
        {
            isBoosting = true;
        }
    }
    
    private void UpdateVisualEffects()
    {
        if (isBoosting)
        {
            if (!boostParticles.isPlaying)
            {
                boostParticles.Play();
            }
            
            foreach (var trail in boostTrails)
            {
                trail.emitting = true;
            }
            
            ParticleManager.Instance.UpdateBoostEffect(true);
        }
        else
        {
            boostParticles.Stop();
            
            foreach (var trail in boostTrails)
            {
                trail.emitting = false;
            }
            
            ParticleManager.Instance.UpdateBoostEffect(false);
        }
    }
    
    public float GetBoostAmount()
    {
        return currentBoost;
    }
    
    public float GetCooldownProgress()
    {
        return 1f - (currentCooldown / boostCooldown);
    }
    
    public bool IsBoosting()
    {
        return isBoosting;
    }
} 