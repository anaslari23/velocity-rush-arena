using UnityEngine;
using System.Collections.Generic;

public class TrackGenerator : MonoBehaviour
{
    [Header("Track Settings")]
    public float trackWidth = 20f;
    public float trackLength = 1000f;
    public int segments = 50;
    public float maxTurnAngle = 45f;
    public float minStraightLength = 50f;
    public float maxStraightLength = 200f;
    
    [Header("Terrain Settings")]
    public float terrainHeight = 0f;
    public float terrainWidth = 100f;
    public Material trackMaterial;
    public Material terrainMaterial;
    
    [Header("Decoration")]
    public GameObject[] trackDecorations;
    public float decorationDensity = 0.1f;
    
    private List<Vector3> trackPoints = new List<Vector3>();
    private List<GameObject> trackSegments = new List<GameObject>();
    private List<GameObject> decorations = new List<GameObject>();
    
    public void GenerateTrack()
    {
        ClearTrack();
        GenerateTrackPoints();
        CreateTrackMesh();
        AddDecorations();
        CreateCheckpoints();
    }
    
    private void ClearTrack()
    {
        // Clear existing track
        foreach (var segment in trackSegments)
        {
            DestroyImmediate(segment);
        }
        trackSegments.Clear();
        
        // Clear decorations
        foreach (var decoration in decorations)
        {
            DestroyImmediate(decoration);
        }
        decorations.Clear();
        
        trackPoints.Clear();
    }
    
    private void GenerateTrackPoints()
    {
        // Start with a straight section
        Vector3 startPoint = Vector3.zero;
        trackPoints.Add(startPoint);
        
        float currentLength = 0f;
        float currentAngle = 0f;
        
        while (currentLength < trackLength)
        {
            // Decide whether to turn or go straight
            if (Random.value < 0.3f && currentLength > minStraightLength)
            {
                // Add a turn
                float turnAngle = Random.Range(-maxTurnAngle, maxTurnAngle);
                currentAngle += turnAngle;
                
                // Add points for the turn
                int turnSegments = Mathf.CeilToInt(Mathf.Abs(turnAngle) / 5f);
                float turnRadius = Random.Range(50f, 100f);
                
                for (int i = 0; i < turnSegments; i++)
                {
                    float segmentAngle = turnAngle / turnSegments;
                    float angleRad = (currentAngle + segmentAngle * i) * Mathf.Deg2Rad;
                    
                    Vector3 newPoint = trackPoints[trackPoints.Count - 1];
                    newPoint.x += Mathf.Sin(angleRad) * turnRadius;
                    newPoint.z += Mathf.Cos(angleRad) * turnRadius;
                    
                    trackPoints.Add(newPoint);
                    currentLength += turnRadius * Mathf.Abs(segmentAngle) * Mathf.Deg2Rad;
                }
            }
            else
            {
                // Add a straight section
                float straightLength = Random.Range(minStraightLength, maxStraightLength);
                float angleRad = currentAngle * Mathf.Deg2Rad;
                
                Vector3 newPoint = trackPoints[trackPoints.Count - 1];
                newPoint.x += Mathf.Sin(angleRad) * straightLength;
                newPoint.z += Mathf.Cos(angleRad) * straightLength;
                
                trackPoints.Add(newPoint);
                currentLength += straightLength;
            }
        }
    }
    
    private void CreateTrackMesh()
    {
        GameObject trackObject = new GameObject("Track");
        trackObject.transform.parent = transform;
        
        MeshFilter meshFilter = trackObject.AddComponent<MeshFilter>();
        MeshRenderer meshRenderer = trackObject.AddComponent<MeshRenderer>();
        meshRenderer.material = trackMaterial;
        
        Mesh trackMesh = new Mesh();
        List<Vector3> vertices = new List<Vector3>();
        List<int> triangles = new List<int>();
        List<Vector2> uv = new List<Vector2>();
        
        for (int i = 0; i < trackPoints.Count; i++)
        {
            Vector3 currentPoint = trackPoints[i];
            Vector3 nextPoint = trackPoints[(i + 1) % trackPoints.Count];
            
            Vector3 direction = (nextPoint - currentPoint).normalized;
            Vector3 perpendicular = Vector3.Cross(direction, Vector3.up).normalized;
            
            // Add vertices for this segment
            vertices.Add(currentPoint + perpendicular * trackWidth * 0.5f);
            vertices.Add(currentPoint - perpendicular * trackWidth * 0.5f);
            
            // Add UV coordinates
            uv.Add(new Vector2(0, i % 2));
            uv.Add(new Vector2(1, i % 2));
            
            if (i > 0)
            {
                // Add triangles
                int baseIndex = i * 2;
                triangles.Add(baseIndex - 2);
                triangles.Add(baseIndex - 1);
                triangles.Add(baseIndex);
                triangles.Add(baseIndex - 1);
                triangles.Add(baseIndex + 1);
                triangles.Add(baseIndex);
            }
        }
        
        // Connect last segment to first
        int lastBaseIndex = (trackPoints.Count - 1) * 2;
        triangles.Add(lastBaseIndex);
        triangles.Add(lastBaseIndex + 1);
        triangles.Add(0);
        triangles.Add(lastBaseIndex + 1);
        triangles.Add(1);
        triangles.Add(0);
        
        trackMesh.vertices = vertices.ToArray();
        trackMesh.triangles = triangles.ToArray();
        trackMesh.uv = uv.ToArray();
        trackMesh.RecalculateNormals();
        
        meshFilter.mesh = trackMesh;
        trackSegments.Add(trackObject);
    }
    
    private void AddDecorations()
    {
        if (trackDecorations.Length == 0) return;
        
        for (int i = 0; i < trackPoints.Count; i++)
        {
            if (Random.value < decorationDensity)
            {
                Vector3 position = trackPoints[i];
                GameObject decoration = Instantiate(
                    trackDecorations[Random.Range(0, trackDecorations.Length)],
                    position,
                    Quaternion.Euler(0, Random.Range(0, 360), 0)
                );
                decoration.transform.parent = transform;
                decorations.Add(decoration);
            }
        }
    }
    
    private void CreateCheckpoints()
    {
        GameObject checkpointsParent = new GameObject("Checkpoints");
        checkpointsParent.transform.parent = transform;
        
        CheckpointSystem checkpointSystem = gameObject.AddComponent<CheckpointSystem>();
        checkpointSystem.checkpoints.Clear();
        
        for (int i = 0; i < trackPoints.Count; i += 5) // Create checkpoints every 5 points
        {
            GameObject checkpointObj = new GameObject($"Checkpoint_{i}");
            checkpointObj.transform.parent = checkpointsParent.transform;
            checkpointObj.transform.position = trackPoints[i];
            
            // Create visual representation
            GameObject visual = GameObject.CreatePrimitive(PrimitiveType.Cube);
            visual.transform.parent = checkpointObj.transform;
            visual.transform.localPosition = Vector3.zero;
            visual.transform.localScale = new Vector3(trackWidth, 2f, 2f);
            
            CheckpointSystem.Checkpoint checkpoint = new CheckpointSystem.Checkpoint
            {
                transform = checkpointObj.transform,
                isStartFinishLine = (i == 0)
            };
            
            checkpointSystem.checkpoints.Add(checkpoint);
        }
    }
    
    private void OnDrawGizmos()
    {
        if (trackPoints.Count == 0) return;
        
        Gizmos.color = Color.yellow;
        for (int i = 0; i < trackPoints.Count; i++)
        {
            Gizmos.DrawSphere(trackPoints[i], 2f);
            if (i < trackPoints.Count - 1)
            {
                Gizmos.DrawLine(trackPoints[i], trackPoints[i + 1]);
            }
        }
        Gizmos.DrawLine(trackPoints[trackPoints.Count - 1], trackPoints[0]);
    }
} 