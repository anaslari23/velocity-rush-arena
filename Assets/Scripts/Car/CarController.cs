using UnityEngine;

public class CarController : MonoBehaviour
{
    [Header("Car Settings")]
    public float maxSpeed = 200f;
    public float acceleration = 10f;
    public float deceleration = 5f;
    public float turnSpeed = 100f;
    public float driftFactor = 0.95f;
    
    [Header("Boost System")]
    public BoostSystem boostSystem;
    
    private float currentSpeed;
    private float horizontalInput;
    private float verticalInput;
    private Rigidbody rb;
    
    private void Awake()
    {
        rb = GetComponent<Rigidbody>();
        if (boostSystem == null)
        {
            boostSystem = GetComponent<BoostSystem>();
        }
    }
    
    private void Update()
    {
        // Get input
        horizontalInput = Input.GetAxis("Horizontal");
        verticalInput = Input.GetAxis("Vertical");
        
        // Handle boost
        if (Input.GetKey(KeyCode.Space) && boostSystem != null)
        {
            boostSystem.UseBoost();
        }
    }
    
    private void FixedUpdate()
    {
        // Calculate speed
        float targetSpeed = verticalInput * maxSpeed;
        if (boostSystem != null && boostSystem.isBoosting)
        {
            targetSpeed *= boostSystem.boostMultiplier;
        }
        
        currentSpeed = Mathf.Lerp(currentSpeed, targetSpeed, Time.fixedDeltaTime * acceleration);
        
        // Apply movement
        Vector3 movement = transform.forward * currentSpeed * Time.fixedDeltaTime;
        rb.MovePosition(rb.position + movement);
        
        // Apply rotation
        float turn = horizontalInput * turnSpeed * Time.fixedDeltaTime;
        Quaternion turnRotation = Quaternion.Euler(0f, turn, 0f);
        rb.MoveRotation(rb.rotation * turnRotation);
        
        // Apply drift
        if (Mathf.Abs(horizontalInput) > 0.1f && currentSpeed > 10f)
        {
            rb.velocity = Vector3.Lerp(rb.velocity, rb.velocity * driftFactor, Time.fixedDeltaTime);
        }
    }
    
    public float GetSpeed()
    {
        return currentSpeed;
    }
    
    public float GetRaceProgress()
    {
        // This should be implemented based on your checkpoint system
        return 0f;
    }
} 