using UnityEngine;

public class GarageCamera : MonoBehaviour
{
    [Header("Camera Settings")]
    public float rotationSpeed = 2f;
    public float zoomSpeed = 5f;
    public float minZoom = 5f;
    public float maxZoom = 15f;
    public float smoothTime = 0.3f;
    
    [Header("Target")]
    public Transform target;
    public Vector3 offset = new Vector3(0, 2, -10);
    
    private Vector3 currentVelocity;
    private float currentZoom;
    private float targetRotation;
    
    private void Start()
    {
        currentZoom = -offset.z;
        targetRotation = transform.eulerAngles.y;
    }
    
    private void LateUpdate()
    {
        if (target == null) return;
        
        // Handle rotation input
        if (Input.GetMouseButton(1))
        {
            targetRotation += Input.GetAxis("Mouse X") * rotationSpeed;
        }
        
        // Handle zoom input
        float scrollInput = Input.GetAxis("Mouse ScrollWheel");
        if (scrollInput != 0)
        {
            currentZoom = Mathf.Clamp(currentZoom - scrollInput * zoomSpeed, minZoom, maxZoom);
        }
        
        // Calculate target position
        Vector3 targetPosition = target.position;
        Quaternion rotation = Quaternion.Euler(0, targetRotation, 0);
        Vector3 desiredPosition = targetPosition + rotation * new Vector3(0, offset.y, -currentZoom);
        
        // Smoothly move camera
        transform.position = Vector3.SmoothDamp(transform.position, desiredPosition, ref currentVelocity, smoothTime);
        
        // Look at target
        transform.LookAt(targetPosition + Vector3.up * offset.y);
    }
    
    public void SetTarget(Transform newTarget)
    {
        target = newTarget;
        currentVelocity = Vector3.zero;
    }
} 