using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    [Header("Target Settings")]
    public Transform target;
    public Vector3 offset = new Vector3(0, 5, -10);
    
    [Header("Follow Settings")]
    public float smoothSpeed = 10f;
    public float rotationSpeed = 5f;
    public float lookAheadFactor = 3f;
    public float lookAheadReturnSpeed = 0.5f;
    public float lookAheadMoveThreshold = 0.1f;
    
    private Vector3 lastTargetPosition;
    private Vector3 currentVelocity;
    private Vector3 lookAheadPos;
    
    private void Start()
    {
        if (target == null)
        {
            Debug.LogError("CameraFollow: No target assigned!");
            return;
        }
        
        lastTargetPosition = target.position;
        transform.position = target.position + offset;
        transform.LookAt(target);
    }
    
    private void LateUpdate()
    {
        if (target == null) return;
        
        // Calculate look ahead position
        float xMoveDelta = (target.position - lastTargetPosition).x;
        bool updateLookAheadTarget = Mathf.Abs(xMoveDelta) > lookAheadMoveThreshold;
        
        if (updateLookAheadTarget)
        {
            lookAheadPos = lookAheadFactor * Vector3.right * Mathf.Sign(xMoveDelta);
        }
        else
        {
            lookAheadPos = Vector3.MoveTowards(lookAheadPos, Vector3.zero, Time.deltaTime * lookAheadReturnSpeed);
        }
        
        // Calculate desired position
        Vector3 targetPosition = target.position + offset + lookAheadPos;
        
        // Smoothly move camera
        transform.position = Vector3.SmoothDamp(transform.position, targetPosition, ref currentVelocity, smoothSpeed * Time.deltaTime);
        
        // Smoothly rotate camera to look at target
        Quaternion targetRotation = Quaternion.LookRotation(target.position - transform.position);
        transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);
        
        lastTargetPosition = target.position;
    }
} 