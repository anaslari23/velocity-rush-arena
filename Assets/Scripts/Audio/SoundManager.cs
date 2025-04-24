using UnityEngine;
using System.Collections.Generic;

public class SoundManager : MonoBehaviour
{
    public static SoundManager Instance { get; private set; }
    
    [Header("Audio Sources")]
    public AudioSource musicSource;
    public AudioSource sfxSource;
    
    [Header("Audio Clips")]
    public AudioClip mainMenuMusic;
    public AudioClip garageMusic;
    public AudioClip raceMusic;
    public AudioClip buttonClick;
    public AudioClip lapComplete;
    public AudioClip raceEnd;
    
    private Dictionary<string, AudioClip> sfxClips = new Dictionary<string, AudioClip>();
    
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
        
        // Initialize SFX dictionary
        sfxClips["ButtonClick"] = buttonClick;
        sfxClips["LapComplete"] = lapComplete;
        sfxClips["RaceEnd"] = raceEnd;
    }
    
    public void PlayMusic(AudioClip music)
    {
        if (musicSource.clip != music)
        {
            musicSource.clip = music;
            musicSource.Play();
        }
    }
    
    public void PlaySFX(string sfxName)
    {
        if (sfxClips.ContainsKey(sfxName))
        {
            sfxSource.PlayOneShot(sfxClips[sfxName]);
        }
    }
    
    public void SetMusicVolume(float volume)
    {
        musicSource.volume = volume;
    }
    
    public void SetSFXVolume(float volume)
    {
        sfxSource.volume = volume;
    }
    
    public void PauseMusic()
    {
        musicSource.Pause();
    }
    
    public void ResumeMusic()
    {
        musicSource.UnPause();
    }
} 