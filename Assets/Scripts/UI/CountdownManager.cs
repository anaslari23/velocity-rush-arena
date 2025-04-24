using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;

public class CountdownManager : MonoBehaviour
{
    public static CountdownManager Instance { get; private set; }
    
    [Header("Countdown Settings")]
    public float countdownDuration = 3f;
    public TextMeshProUGUI countdownText;
    public GameObject countdownPanel;
    
    private bool isCountingDown = false;
    
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
    
    public void StartCountdown()
    {
        if (!isCountingDown)
        {
            StartCoroutine(CountdownCoroutine());
        }
    }
    
    private IEnumerator CountdownCoroutine()
    {
        isCountingDown = true;
        countdownPanel.SetActive(true);
        
        // 3
        countdownText.text = "3";
        SoundManager.Instance.PlaySFX("ButtonClick");
        yield return new WaitForSeconds(1f);
        
        // 2
        countdownText.text = "2";
        SoundManager.Instance.PlaySFX("ButtonClick");
        yield return new WaitForSeconds(1f);
        
        // 1
        countdownText.text = "1";
        SoundManager.Instance.PlaySFX("ButtonClick");
        yield return new WaitForSeconds(1f);
        
        // GO!
        countdownText.text = "GO!";
        SoundManager.Instance.PlaySFX("ButtonClick");
        yield return new WaitForSeconds(1f);
        
        countdownPanel.SetActive(false);
        isCountingDown = false;
    }
    
    public void StopCountdown()
    {
        StopAllCoroutines();
        countdownPanel.SetActive(false);
        isCountingDown = false;
    }
} 