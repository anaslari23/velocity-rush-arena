using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class MainMenuManager : MonoBehaviour
{
    [Header("UI Elements")]
    public GameObject mainPanel;
    public Button startButton;
    public Button garageButton;
    public Button settingsButton;
    public Button quitButton;
    
    [Header("Settings Panel")]
    public GameObject settingsPanel;
    public Slider musicVolumeSlider;
    public Slider sfxVolumeSlider;
    public Button backButton;
    
    private void Start()
    {
        InitializeUI();
        SoundManager.Instance.PlayMusic(SoundManager.Instance.mainMenuMusic);
    }
    
    private void InitializeUI()
    {
        // Main menu buttons
        startButton.onClick.AddListener(() => {
            SoundManager.Instance.PlaySFX("ButtonClick");
            GameManager.Instance.LoadScene("RaceTrack");
        });
        
        garageButton.onClick.AddListener(() => {
            SoundManager.Instance.PlaySFX("ButtonClick");
            GameManager.Instance.LoadScene("Garage");
        });
        
        settingsButton.onClick.AddListener(() => {
            SoundManager.Instance.PlaySFX("ButtonClick");
            ShowSettings();
        });
        
        quitButton.onClick.AddListener(() => {
            SoundManager.Instance.PlaySFX("ButtonClick");
            Application.Quit();
        });
        
        // Settings panel
        musicVolumeSlider.onValueChanged.AddListener(SetMusicVolume);
        sfxVolumeSlider.onValueChanged.AddListener(SetSFXVolume);
        backButton.onClick.AddListener(() => {
            SoundManager.Instance.PlaySFX("ButtonClick");
            HideSettings();
        });
        
        // Initialize volume sliders
        musicVolumeSlider.value = PlayerPrefs.GetFloat("MusicVolume", 0.5f);
        sfxVolumeSlider.value = PlayerPrefs.GetFloat("SFXVolume", 0.5f);
        
        // Hide settings panel initially
        settingsPanel.SetActive(false);
    }
    
    private void ShowSettings()
    {
        mainPanel.SetActive(false);
        settingsPanel.SetActive(true);
    }
    
    private void HideSettings()
    {
        settingsPanel.SetActive(false);
        mainPanel.SetActive(true);
    }
    
    private void SetMusicVolume(float volume)
    {
        SoundManager.Instance.SetMusicVolume(volume);
        PlayerPrefs.SetFloat("MusicVolume", volume);
    }
    
    private void SetSFXVolume(float volume)
    {
        SoundManager.Instance.SetSFXVolume(volume);
        PlayerPrefs.SetFloat("SFXVolume", volume);
    }
} 