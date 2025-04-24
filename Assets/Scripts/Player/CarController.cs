using UnityEngine;

public class CarController : MonoBehaviour
{
    [Header("Car Settings")]
    public float maxSpeed = 200f;
    public float acceleration = 10f;
    public float deceleration = 5f;
    public float turnSpeed = 100f;
    public float driftFactor = 0.95f;
    public float downforce = 10f;
    
    [Header("Wheel Settings")]
    public Transform[] wheelMeshes;
    public float wheelRotationSpeed = 200f;
    public float wheelTurnAngle = 30f;
    
    [Header("Physics Settings")]
    public float suspensionHeight = 0.5f;
    public float suspensionSpring = 100f;
    public float suspensionDamper = 10f;
    
    private float currentSpeed;
    private float currentTurnAngle;
    private Rigidbody rb;
    private bool isAI = false;
    private float aiHorizontalInput;
    private float aiVerticalInput;
    
    private void Start()
    {
        rb = GetComponent<Rigidbody>();
        rb.centerOfMass = new Vector3(0, -0.5f, 0);
    }
    
    private void Update()
    {
        if (!isAI)
        {
            HandleInput();
        }
        UpdateWheelRotation();
        UpdateWheelSteering();
    }
    
    private void FixedUpdate()
    {
        ApplyMovement();
        ApplySteering();
        ApplyDownforce();
        ApplySuspension();
    }
    
    private void HandleInput()
    {
        // Get input
        float verticalInput = Input.GetAxis("Vertical");
        float horizontalInput = Input.GetAxis("Horizontal");
        
        // Calculate speed
        if (verticalInput > 0)
        {
            currentSpeed = Mathf.Lerp(currentSpeed, maxSpeed * verticalInput, acceleration * Time.deltaTime);
        }
        else if (verticalInput < 0)
        {
            currentSpeed = Mathf.Lerp(currentSpeed, maxSpeed * verticalInput, deceleration * Time.deltaTime);
        }
        else
        {
            currentSpeed = Mathf.Lerp(currentSpeed, 0, deceleration * Time.deltaTime);
        }
        
        // Calculate turn angle
        currentTurnAngle = horizontalInput * turnSpeed;
    }
    
    public void ApplyAIInput(float horizontalInput, float verticalInput)
    {
        isAI = true;
        aiHorizontalInput = horizontalInput;
        aiVerticalInput = verticalInput;
        
        // Calculate speed
        if (verticalInput > 0)
        {
            currentSpeed = Mathf.Lerp(currentSpeed, maxSpeed * verticalInput, acceleration * Time.deltaTime);
        }
        else if (verticalInput < 0)
        {
            currentSpeed = Mathf.Lerp(currentSpeed, maxSpeed * verticalInput, deceleration * Time.deltaTime);
        }
        else
        {
            currentSpeed = Mathf.Lerp(currentSpeed, 0, deceleration * Time.deltaTime);
        }
        
        // Calculate turn angle
        currentTurnAngle = horizontalInput * turnSpeed;
    }
    
    private void ApplyMovement()
    {
        // Apply forward/backward movement
        Vector3 movement = transform.forward * currentSpeed * Time.fixedDeltaTime;
        rb.MovePosition(rb.position + movement);
    }
    
    private void ApplySteering()
    {
        // Apply rotation
        Quaternion turnRotation = Quaternion.Euler(0, currentTurnAngle * Time.fixedDeltaTime, 0);
        rb.MoveRotation(rb.rotation * turnRotation);
        
        // Apply drift
        if (Mathf.Abs(currentTurnAngle) > 0.1f)
        {
            Vector3 velocity = rb.velocity;
            velocity = Vector3.Lerp(velocity, transform.forward * velocity.magnitude, driftFactor * Time.fixedDeltaTime);
            rb.velocity = velocity;
        }
    }
    
    private void ApplyDownforce()
    {
        // Apply downforce based on speed
        float downforceAmount = downforce * (currentSpeed / maxSpeed);
        rb.AddForce(-transform.up * downforceAmount, ForceMode.Force);
    }
    
    private void ApplySuspension()
    {
        // Simple suspension simulation
        RaycastHit hit;
        if (Physics.Raycast(transform.position, -transform.up, out hit, suspensionHeight))
        {
            float springForce = (suspensionHeight - hit.distance) * suspensionSpring;
            float damperForce = -rb.velocity.y * suspensionDamper;
            rb.AddForce(transform.up * (springForce + damperForce), ForceMode.Force);
        }
    }
    
    private void UpdateWheelRotation()
    {
        // Rotate wheel meshes
        float wheelRotation = currentSpeed * wheelRotationSpeed * Time.deltaTime;
        foreach (Transform wheel in wheelMeshes)
        {
            wheel.Rotate(wheelRotation, 0, 0);
        }
    }
    
    private void UpdateWheelSteering()
    {
        // Steer front wheels
        float turnAngle = currentTurnAngle / turnSpeed * wheelTurnAngle;
        for (int i = 0; i < 2; i++) // Assuming first two wheels are front wheels
        {
            if (i < wheelMeshes.Length)
            {
                Vector3 euler = wheelMeshes[i].localEulerAngles;
                euler.y = turnAngle;
                wheelMeshes[i].localEulerAngles = euler;
            }
        }
    }
} 