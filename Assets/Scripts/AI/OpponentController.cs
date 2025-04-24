using UnityEngine;
using System.Collections.Generic;

public class OpponentController : MonoBehaviour
{
    [Header("Path Following")]
    public Transform[] pathPoints;
    public float pathRadius = 5f;
    public float maxSteerAngle = 45f;
    
    [Header("Driving Behavior")]
    public float maxSpeed = 180f;
    public float acceleration = 8f;
    public float deceleration = 6f;
    public float brakeForce = 10f;
    public float avoidanceForce = 5f;
    
    [Header("AI Settings")]
    public float lookAheadDistance = 20f;
    public float lookAheadMultiplier = 0.5f;
    public float corneringSpeed = 0.8f;
    
    private CarController carController;
    private int currentPathIndex = 0;
    private float currentSpeed;
    private Rigidbody rb;
    
    private void Start()
    {
        carController = GetComponent<CarController>();
        rb = GetComponent<Rigidbody>();
    }
    
    private void Update()
    {
        if (pathPoints.Length == 0) return;
        
        // Calculate target position
        Vector3 targetPosition = GetTargetPosition();
        
        // Calculate steering angle
        float steerAngle = CalculateSteeringAngle(targetPosition);
        
        // Calculate speed
        float targetSpeed = CalculateTargetSpeed(steerAngle);
        
        // Apply controls
        ApplyControls(steerAngle, targetSpeed);
    }
    
    private Vector3 GetTargetPosition()
    {
        // Get current path point
        Vector3 currentPoint = pathPoints[currentPathIndex].position;
        
        // Calculate look ahead distance based on speed
        float dynamicLookAhead = lookAheadDistance + (currentSpeed * lookAheadMultiplier);
        
        // Check if we've reached the current point
        if (Vector3.Distance(transform.position, currentPoint) < pathRadius)
        {
            currentPathIndex = (currentPathIndex + 1) % pathPoints.Length;
        }
        
        return currentPoint;
    }
    
    private float CalculateSteeringAngle(Vector3 targetPosition)
    {
        Vector3 targetDirection = targetPosition - transform.position;
        float angle = Vector3.SignedAngle(transform.forward, targetDirection, Vector3.up);
        return Mathf.Clamp(angle, -maxSteerAngle, maxSteerAngle);
    }
    
    private float CalculateTargetSpeed(float steerAngle)
    {
        // Reduce speed when turning
        float speedMultiplier = 1f - (Mathf.Abs(steerAngle) / maxSteerAngle * corneringSpeed);
        return maxSpeed * speedMultiplier;
    }
    
    private void ApplyControls(float steerAngle, float targetSpeed)
    {
        // Convert steer angle to -1 to 1 range
        float horizontalInput = steerAngle / maxSteerAngle;
        
        // Calculate vertical input based on current speed
        float verticalInput = 0f;
        if (currentSpeed < targetSpeed)
        {
            verticalInput = 1f;
        }
        else if (currentSpeed > targetSpeed)
        {
            verticalInput = -1f;
        }
        
        // Apply inputs to car controller
        carController.ApplyAIInput(horizontalInput, verticalInput);
    }
    
    private void OnDrawGizmos()
    {
        if (pathPoints.Length == 0) return;
        
        // Draw path
        Gizmos.color = Color.yellow;
        for (int i = 0; i < pathPoints.Length; i++)
        {
            if (pathPoints[i] != null)
            {
                Gizmos.DrawSphere(pathPoints[i].position, pathRadius);
                if (i < pathPoints.Length - 1 && pathPoints[i + 1] != null)
                {
                    Gizmos.DrawLine(pathPoints[i].position, pathPoints[i + 1].position);
                }
            }
        }
        
        // Draw connection from last to first point
        if (pathPoints.Length > 1 && pathPoints[0] != null && pathPoints[pathPoints.Length - 1] != null)
        {
            Gizmos.DrawLine(pathPoints[pathPoints.Length - 1].position, pathPoints[0].position);
        }
    }
} 