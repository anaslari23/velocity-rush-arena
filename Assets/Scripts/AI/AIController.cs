using UnityEngine;
using System.Collections.Generic;

public class AIController : MonoBehaviour
{
    [Header("AI Settings")]
    public float maxSpeed = 180f;
    public float acceleration = 8f;
    public float deceleration = 5f;
    public float turnSpeed = 80f;
    public float waypointDistance = 5f;
    public float lookAheadDistance = 10f;
    
    [Header("Behavior Settings")]
    public float aggression = 0.5f;
    public float caution = 0.5f;
    public float skillLevel = 0.5f;
    
    private CarController carController;
    private Transform[] waypoints;
    private int currentWaypointIndex;
    private Vector3 targetPosition;
    private float currentSpeed;
    private float targetSpeed;
    private Rigidbody rb;
    
    public void Initialize(Transform[] checkpoints)
    {
        waypoints = checkpoints;
        carController = GetComponent<CarController>();
        rb = GetComponent<Rigidbody>();
        currentWaypointIndex = 0;
        UpdateTargetPosition();
    }
    
    private void FixedUpdate()
    {
        if (waypoints == null || waypoints.Length == 0) return;
        
        // Get current waypoint
        Transform targetWaypoint = waypoints[currentWaypointIndex];
        
        // Calculate direction to waypoint
        Vector3 direction = targetWaypoint.position - transform.position;
        direction.y = 0f;
        
        // Calculate distance to waypoint
        float distance = direction.magnitude;
        
        // Move towards waypoint
        if (distance > waypointDistance)
        {
            // Calculate target rotation
            Quaternion targetRotation = Quaternion.LookRotation(direction);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, turnSpeed * Time.fixedDeltaTime);
            
            // Move forward
            rb.velocity = transform.forward * maxSpeed * Time.fixedDeltaTime;
        }
        else
        {
            // Move to next waypoint
            currentWaypointIndex = (currentWaypointIndex + 1) % waypoints.Length;
        }
    }
    
    private void Update()
    {
        if (waypoints == null || waypoints.Length == 0) return;
        
        UpdateTargetPosition();
        CalculateSteering();
        CalculateSpeed();
        
        // Apply AI inputs to car controller
        carController.ApplyAIInput(CalculateHorizontalInput(), CalculateVerticalInput());
    }
    
    private void UpdateTargetPosition()
    {
        if (Vector3.Distance(transform.position, waypoints[currentWaypointIndex].position) < waypointDistance)
        {
            currentWaypointIndex = (currentWaypointIndex + 1) % waypoints.Length;
        }
        
        targetPosition = waypoints[currentWaypointIndex].position;
    }
    
    private void CalculateSteering()
    {
        Vector3 directionToTarget = (targetPosition - transform.position).normalized;
        float angleToTarget = Vector3.SignedAngle(transform.forward, directionToTarget, Vector3.up);
        
        // Adjust steering based on skill level and caution
        float steeringFactor = Mathf.Clamp(angleToTarget / 45f, -1f, 1f);
        steeringFactor *= (1f - caution) * skillLevel;
        
        targetSpeed = maxSpeed * (1f - Mathf.Abs(steeringFactor) * 0.5f);
    }
    
    private void CalculateSpeed()
    {
        // Adjust speed based on distance to waypoint and caution level
        float distanceToWaypoint = Vector3.Distance(transform.position, targetPosition);
        float speedFactor = Mathf.Clamp01(distanceToWaypoint / lookAheadDistance);
        
        targetSpeed *= speedFactor * (1f - caution);
        
        // Gradually adjust current speed
        if (currentSpeed < targetSpeed)
        {
            currentSpeed = Mathf.Lerp(currentSpeed, targetSpeed, acceleration * Time.deltaTime);
        }
        else
        {
            currentSpeed = Mathf.Lerp(currentSpeed, targetSpeed, deceleration * Time.deltaTime);
        }
    }
    
    private float CalculateHorizontalInput()
    {
        Vector3 directionToTarget = (targetPosition - transform.position).normalized;
        float angleToTarget = Vector3.SignedAngle(transform.forward, directionToTarget, Vector3.up);
        return Mathf.Clamp(angleToTarget / 45f, -1f, 1f);
    }
    
    private float CalculateVerticalInput()
    {
        return currentSpeed / maxSpeed;
    }
    
    public void SetWaypoints(Transform[] newWaypoints)
    {
        waypoints = newWaypoints;
        currentWaypointIndex = 0;
    }
    
    public void SetBehavior(float newAggression, float newCaution, float newSkillLevel)
    {
        aggression = Mathf.Clamp01(newAggression);
        caution = Mathf.Clamp01(newCaution);
        skillLevel = Mathf.Clamp01(newSkillLevel);
    }
    
    public float GetRaceProgress()
    {
        if (waypoints == null || waypoints.Length == 0) return 0f;
        
        float totalDistance = 0f;
        float currentDistance = 0f;
        
        // Calculate total track distance
        for (int i = 0; i < waypoints.Length; i++)
        {
            int nextIndex = (i + 1) % waypoints.Length;
            totalDistance += Vector3.Distance(waypoints[i].position, waypoints[nextIndex].position);
        }
        
        // Calculate current progress
        for (int i = 0; i < currentWaypointIndex; i++)
        {
            int nextIndex = (i + 1) % waypoints.Length;
            currentDistance += Vector3.Distance(waypoints[i].position, waypoints[nextIndex].position);
        }
        
        currentDistance += Vector3.Distance(transform.position, waypoints[currentWaypointIndex].position);
        
        return currentDistance / totalDistance;
    }
} 