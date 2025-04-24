using UnityEngine;
using System.Collections.Generic;

public class TrackManager : MonoBehaviour
{
    public static TrackManager Instance { get; private set; }
    
    [Header("Track Settings")]
    public GameObject trackSegmentPrefab;
    public GameObject checkpointPrefab;
    public GameObject finishLinePrefab;
    public int trackSegments = 20;
    public float segmentLength = 50f;
    public float trackWidth = 20f;
    public float curveRadius = 100f;
    
    [Header("Starting Grid")]
    public Transform[] startingPositions;
    public float gridSpacing = 5f;
    
    private List<GameObject> trackSegments = new List<GameObject>();
    private List<Transform> checkpoints = new List<Transform>();
    private Transform finishLine;
    
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
    
    private void Start()
    {
        GenerateTrack();
        SetupStartingGrid();
    }
    
    private void GenerateTrack()
    {
        // Clear existing track
        foreach (var segment in trackSegments)
        {
            Destroy(segment);
        }
        trackSegments.Clear();
        checkpoints.Clear();
        
        // Generate new track
        Vector3 position = Vector3.zero;
        Quaternion rotation = Quaternion.identity;
        
        for (int i = 0; i < trackSegments; i++)
        {
            // Create track segment
            GameObject segment = Instantiate(trackSegmentPrefab, position, rotation);
            trackSegments.Add(segment);
            
            // Create checkpoint
            GameObject checkpoint = Instantiate(checkpointPrefab, position, rotation);
            checkpoints.Add(checkpoint.transform);
            
            // Update position and rotation for next segment
            if (i % 4 == 0) // Create curve every 4 segments
            {
                rotation *= Quaternion.Euler(0, 90f, 0);
                position += rotation * new Vector3(curveRadius, 0, curveRadius);
            }
            else
            {
                position += rotation * new Vector3(0, 0, segmentLength);
            }
        }
        
        // Create finish line
        finishLine = Instantiate(finishLinePrefab, Vector3.zero, Quaternion.identity).transform;
        
        // Update RaceManager with checkpoints
        RaceManager.Instance.checkpoints = checkpoints.ToArray();
        RaceManager.Instance.finishLine = finishLine;
    }
    
    private void SetupStartingGrid()
    {
        // Create starting positions in a grid formation
        startingPositions = new Transform[8]; // 8 starting positions
        
        for (int i = 0; i < startingPositions.Length; i++)
        {
            GameObject gridPoint = new GameObject($"StartingPosition_{i}");
            gridPoint.transform.parent = transform;
            
            // Calculate position in grid
            int row = i / 2;
            int col = i % 2;
            float xPos = (col - 0.5f) * gridSpacing;
            float zPos = row * gridSpacing;
            
            gridPoint.transform.localPosition = new Vector3(xPos, 0, zPos);
            startingPositions[i] = gridPoint.transform;
        }
    }
    
    public Transform GetStartingPosition(int position)
    {
        if (position >= 0 && position < startingPositions.Length)
        {
            return startingPositions[position];
        }
        return null;
    }
    
    public void ResetTrack()
    {
        GenerateTrack();
    }
} 