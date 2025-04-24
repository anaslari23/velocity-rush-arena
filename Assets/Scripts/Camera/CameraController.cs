using UnityEngine;

public class CameraController : MonoBehaviour
{
    [Header("Follow Settings")]
    public Transform target;
    public float followSpeed = 10f;
    public float rotationSpeed = 5f;
    public Vector3 offset = new Vector3(0, 5, -10);
    
    [Header("Look Settings")]
    public float lookAheadDistance = 5f;
    public float lookAheadSpeed = 5f;
    
    [Header("Shake Settings")]
    public float shakeDuration = 0.5f;
    public float shakeMagnitude = 0.1f;
    
    private Vector3 targetPosition;
    private Vector3 lookAheadTarget;
    private float currentShakeDuration;
    private Vector3 originalPosition;
    
    private void Start()
    {
        if (target == null)
        {
            Debug.LogError("Camera target not assigned!");
            enabled = false;
            return;
        }
        
        originalPosition = transform.position;
    }
    
    private void LateUpdate()
    {
        if (target == null) return;
        
        // Calculate target position with offset
        targetPosition = target.position + target.TransformDirection(offset);
        
        // Calculate look ahead position
        Vector3 targetVelocity = target.GetComponent<Rigidbody>().velocity;
        lookAheadTarget = target.position + targetVelocity.normalized * lookAheadDistance;
        
        // Smoothly move camera
        transform.position = Vector3.Lerp(transform.position, targetPosition, followSpeed * Time.deltaTime);
        
        // Look at target with look ahead
        Vector3 lookTarget = Vector3.Lerp(target.position, lookAheadTarget, lookAheadSpeed * Time.deltaTime);
        Quaternion targetRotation = Quaternion.LookRotation(lookTarget - transform.position);
        transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);
        
        // Apply camera shake if active
        if (currentShakeDuration > 0)
        {
            transform.position += Random.insideUnitSphere * shakeMagnitude;
            currentShakeDuration -= Time.deltaTime;
        }
    }
    
    public void ShakeCamera()
    {
        currentShakeDuration = shakeDuration;
    }
    
    public void SetTarget(Transform newTarget)
    {
        target = newTarget;
    }
    
    public void SetOffset(Vector3 newOffset)
    {
        offset = newOffset;
    }
} 