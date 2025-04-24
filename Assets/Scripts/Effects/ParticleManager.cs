using UnityEngine;
using System.Collections.Generic;

public class ParticleManager : MonoBehaviour
{
    public static ParticleManager Instance { get; private set; }
    
    [Header("Exhaust Effects")]
    public ParticleSystem normalExhaust;
    public ParticleSystem boostExhaust;
    
    [Header("Skid Effects")]
    public ParticleSystem skidSmoke;
    public TrailRenderer[] skidTrails;
    
    [Header("Impact Effects")]
    public ParticleSystem crashEffect;
    public ParticleSystem dustEffect;
    
    [Header("Boost Effects")]
    public ParticleSystem boostEffect;
    public ParticleSystem speedLines;
    
    private Dictionary<WheelCollider, TrailRenderer> wheelTrails = new Dictionary<WheelCollider, TrailRenderer>();
    private bool isBoosting;
    
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
    
    public void InitializeWheelTrails(WheelCollider[] wheels)
    {
        wheelTrails.Clear();
        for (int i = 0; i < wheels.Length && i < skidTrails.Length; i++)
        {
            wheelTrails.Add(wheels[i], skidTrails[i]);
        }
    }
    
    public void UpdateExhaust(bool isBoosting, float speed, float maxSpeed)
    {
        this.isBoosting = isBoosting;
        
        if (isBoosting)
        {
            normalExhaust.Stop();
            if (!boostExhaust.isPlaying)
            {
                boostExhaust.Play();
            }
        }
        else
        {
            boostExhaust.Stop();
            if (speed > 0.1f && !normalExhaust.isPlaying)
            {
                normalExhaust.Play();
            }
            else if (speed <= 0.1f)
            {
                normalExhaust.Stop();
            }
        }
    }
    
    public void UpdateSkidEffects(WheelCollider wheel, bool isSkidding, float skidIntensity)
    {
        if (wheelTrails.ContainsKey(wheel))
        {
            TrailRenderer trail = wheelTrails[wheel];
            
            if (isSkidding)
            {
                if (!skidSmoke.isPlaying)
                {
                    skidSmoke.Play();
                }
                
                trail.emitting = true;
                trail.widthMultiplier = skidIntensity;
            }
            else
            {
                trail.emitting = false;
            }
        }
    }
    
    public void PlayCrashEffect(Vector3 position, Vector3 normal)
    {
        crashEffect.transform.position = position;
        crashEffect.transform.rotation = Quaternion.LookRotation(normal);
        crashEffect.Play();
    }
    
    public void PlayDustEffect(Vector3 position)
    {
        dustEffect.transform.position = position;
        dustEffect.Play();
    }
    
    public void UpdateBoostEffect(bool isActive)
    {
        if (isActive)
        {
            if (!boostEffect.isPlaying)
            {
                boostEffect.Play();
            }
            if (!speedLines.isPlaying)
            {
                speedLines.Play();
            }
        }
        else
        {
            boostEffect.Stop();
            speedLines.Stop();
        }
    }
    
    public void StopAllEffects()
    {
        normalExhaust.Stop();
        boostExhaust.Stop();
        skidSmoke.Stop();
        boostEffect.Stop();
        speedLines.Stop();
        
        foreach (var trail in skidTrails)
        {
            trail.emitting = false;
        }
    }
} 