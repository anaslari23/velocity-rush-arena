using UnityEngine;

public class CarPreview : MonoBehaviour
{
    [Header("Rotation Settings")]
    public float rotationSpeed = 10f;
    public bool autoRotate = true;
    public float autoRotationSpeed = 5f;
    
    private bool isDragging;
    private float currentRotation;
    private float targetRotation;
    
    private void Start()
    {
        currentRotation = transform.eulerAngles.y;
        targetRotation = currentRotation;
    }
    
    private void Update()
    {
        if (autoRotate && !isDragging)
        {
            targetRotation += autoRotationSpeed * Time.deltaTime;
        }
        
        // Smoothly rotate to target rotation
        currentRotation = Mathf.LerpAngle(currentRotation, targetRotation, rotationSpeed * Time.deltaTime);
        transform.rotation = Quaternion.Euler(0, currentRotation, 0);
    }
    
    private void OnMouseDown()
    {
        isDragging = true;
    }
    
    private void OnMouseDrag()
    {
        float deltaX = Input.GetAxis("Mouse X");
        targetRotation += deltaX * rotationSpeed;
    }
    
    private void OnMouseUp()
    {
        isDragging = false;
    }
    
    public void ResetRotation()
    {
        targetRotation = 0f;
    }
} 