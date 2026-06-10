import json

def add_metadata():
    main_file = 'C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/utils/blackBookDataFull.json'
    with open(main_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    data[0]["exercises"] = [
        {
          "exerciseNo": "1.1",
          "exerciseName": "Single Correct Answer",
          "totalQuestions": 98
        },
        {
          "exerciseNo": "1.2",
          "exerciseName": "One or More Than One Correct Answer",
          "totalQuestions": 24
        },
        {
          "exerciseNo": "1.3",
          "exerciseName": "Comprehension Type",
          "totalQuestions": 16
        },
        {
          "exerciseNo": "1.4",
          "exerciseName": "Matching Type",
          "totalQuestions": "7 Sets"
        },
        {
          "exerciseNo": "1.5",
          "exerciseName": "Subjective Problems",
          "totalQuestions": 38
        }
    ]
    
    with open(main_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

if __name__ == '__main__':
    add_metadata()
