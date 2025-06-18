import React, { useState, useEffect } from "react";
import { testingApi } from "../services/testingApi";

const TestingDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [testText, setTestText] = useState("");
  const [testResults, setTestResults] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [batchTestResults, setBatchTestResults] = useState(null);
  const [emotionTestScenarios, setEmotionTestScenarios] = useState([]);
  const [complianceTestScenarios, setComplianceTestScenarios] = useState([]);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const emoRes = await testingApi.getScenarios("emotion");
        const compRes = await testingApi.getScenarios("compliance");
        if (emoRes.data.success) setEmotionTestScenarios(emoRes.data.data);
        if (compRes.data.success) setComplianceTestScenarios(compRes.data.data);
      } catch (err) {
        console.error("Failed to load test scenarios:", err);
      }
    };
    loadScenarios();
  }, []);

  const runQuickTest = async () => {
    if (!testText.trim()) return;
    setLoading(true);
    try {
      const response = await testingApi.analyze({
        messages: [{ sender: "customer", text: testText }],
        customer_name: "Test Customer",
        agent_name: "Test Agent",
      });
      setTestResults(response.data);
    } catch (error) {
      setTestResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const runScenarioTest = async (scenario) => {
    setTestText(scenario.text);
    setLoading(true);
    try {
      const response = await testingApi.analyze({
        messages: [{ sender: "customer", text: scenario.text }],
        customer_name: scenario.customer_name || "Test Customer",
        agent_name: scenario.agent_name || "Test Agent",
      });
      setTestResults({
        ...response.data,
        expected: scenario.expected,
        scenario: scenario.name,
      });
    } catch (error) {
      setTestResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const runBatchEmotionTest = async () => {
    setLoading(true);
    setBatchTestResults(null);
    try {
      const res = await testingApi.batch("emotions");
      setBatchTestResults(res.data.data);
    } catch (error) {
      setBatchTestResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const runComplianceTest = async (scenarioIndex = 0) => {
    setLoading(true);

    const testConversation =
      complianceScenarios[scenarioIndex].conversation;
    console.log("testConversation", testConversation);

    try {
      const response = await testingApi.analyze(testConversation);
      console.log("response", response);

      setTestResults({
        ...response.data,
        scenario: complianceScenarios[scenarioIndex].name,
        expectedScore: complianceScenarios[scenarioIndex].expectedScore,
      });
    } catch (error) {
      setTestResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const runSystemValidation = async () => {
    setLoading(true);
    try {
      const response = await testingApi.validate();
      setValidationResults(response.data.data);
    } catch (error) {
      setValidationResults({ error: "Validation endpoint not available." });
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      joy: "text-green-600",
      love: "text-pink-600",
      surprise: "text-blue-600",
      anger: "text-red-700",
      fear: "text-purple-600",
      sadness: "text-gray-700",
    };
    return colors[emotion] || "text-gray-600";
  };

  const quickScenarios = emotionTestScenarios.slice(0, 6);

  const complianceScenarios = [
    {
      name: "Perfect Compliance",
      conversation: {
        messages: [
          {
            sender: "agent",
            text: "Hello! Thank you for calling TechSupport. My name is Sarah. How can I help you today?",
          },
          {
            sender: "customer",
            text: "Hi Sarah, I'm frustrated because my service isn't working!",
          },
          {
            sender: "agent",
            text: "I'm so sorry to hear about that, Mr. Johnson. Let me fix this right away.",
          },
          { sender: "customer", text: "Thank you, I appreciate your help." },
          {
            sender: "agent",
            text: "I've resolved the issue, Mr. Johnson. Everything should be working perfectly now.",
          },
        ],
        customer_name: "Mr. Johnson",
        agent_name: "Sarah",
      },
      expectedScore: "> 90",
    },
    {
      name: "Poor Compliance",
      conversation: {
        messages: [
          { sender: "agent", text: "Yeah, what do you want?" },
          {
            sender: "customer",
            text: "I'm really angry! This service is terrible!",
          },
          { sender: "agent", text: "Not my problem. I'll transfer you." },
          { sender: "customer", text: "This is ridiculous!" },
          { sender: "agent", text: "Whatever." },
        ],
        customer_name: "Customer",
        agent_name: "Agent",
      },
      expectedScore: "< 30",
    },
    {
      name: "Emotion Handling Test",
      conversation: {
        messages: [
          {
            sender: "agent",
            text: "Good morning! How can I assist you today?",
          },
          {
            sender: "customer",
            text: "I'm terrified that my account has been hacked!",
          },
          {
            sender: "agent",
            text: "I understand your concern and I'm here to help. Let me immediately check your account security.",
          },
          {
            sender: "customer",
            text: "Oh wow, thank you for taking this so seriously!",
          },
          {
            sender: "agent",
            text: "Your account is secure. I've added extra security measures for your peace of mind.",
          },
        ],
        customer_name: "Valued Customer",
        agent_name: "Support Agent",
      },
      expectedScore: "> 80",
    },
  ];
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          AI Analysis Testing Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Test and validate your AI analysis system for accuracy
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Emotion Test
          </h2>
          <div className="space-y-4">
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to analyze emotion."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
            />
            <button
              onClick={runQuickTest}
              disabled={loading || !testText.trim()}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Analyzing..." : "Analyze Emotion"}
            </button>
          </div>

          {/* Quick scenarios */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Quick Test Scenarios:
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickScenarios.map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => runScenarioTest(scenario)}
                  disabled={loading}
                  className="text-left p-2 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-gray-500 text-xs">
                    Expected: {scenario.expected}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comprehensive Emotion Testing */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Comprehensive Emotion Testing
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {emotionTestScenarios.map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => runScenarioTest(scenario)}
                  disabled={loading}
                  className="text-left p-3 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{scenario.name}</div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getEmotionColor(
                        scenario.expected
                      )} bg-opacity-10`}
                    >
                      {scenario.expected}
                    </span>
                  </div>
                  <div className="text-gray-600 text-xs mt-1 truncate">
                    "{scenario.text}"
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={runBatchEmotionTest}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 mt-4"
            >
              {loading ? "Running All Tests..." : "Test All Emotions (Batch)"}
            </button>
          </div>
        </div>

        {/* System Tests */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Tests
          </h2>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Compliance Test Scenarios:
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {complianceScenarios.map((scenario, idx) => (
                  <button
                    key={idx}
                    onClick={() => runComplianceTest(idx)}
                    disabled={loading}
                    className="w-full text-left p-2 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    <div className="font-medium">{scenario.name}</div>
                    <div className="text-gray-500 text-xs">
                      Expected Score: {scenario.expectedScore}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={runSystemValidation}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 mt-4"
            >
              {loading ? "Validating..." : "Run System Validation"}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {testResults && (
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Results
          </h2>

          {testResults.error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-md">
              <strong>Error:</strong> {testResults.error}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Emotion Results */}
              {testResults.data?.messages && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Emotion Analysis
                  </h3>
                  {testResults.data.messages.map((message, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-md p-4 mb-3"
                    >
                      <div className="text-sm text-gray-500 mb-1">
                        {message.sender.toUpperCase()}
                      </div>
                      <div className="text-gray-900 mb-2">"{message.text}"</div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${getEmotionColor(
                            message.emotion
                          )}`}
                        >
                          Emotion: {message.emotion}
                        </span>
                        <span className="text-sm text-gray-500">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </span>
                      </div>
                      {testResults.expected && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">
                            Expected: {testResults.expected}
                          </span>
                          <span
                            className={`ml-2 ${
                              message.emotion === testResults.expected
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {message.emotion === testResults.expected
                              ? "✅ Correct"
                              : "❌ Incorrect"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Compliance Results */}
              {testResults.data?.analysis?.compliance_summary && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Compliance Analysis
                    {testResults.scenario && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({testResults.scenario})
                      </span>
                    )}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(
                      testResults.data.analysis.compliance_summary
                    ).map(([rule, passed]) => {
                      // Skip metadata fields
                      if (
                        [
                          "customer_emotions",
                          "negative_emotions_detected",
                        ].includes(rule)
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={rule}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {rule
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              passed ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {passed ? "✅ PASS" : "❌ FAIL"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Emotion Context */}
                  {testResults.data.analysis.compliance_summary
                    .customer_emotions && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Customer Emotions Detected:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {testResults.data.analysis.compliance_summary.customer_emotions.map(
                          (emotion, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 text-xs rounded ${getEmotionColor(
                                emotion
                              )} bg-opacity-20`}
                            >
                              {emotion}
                            </span>
                          )
                        )}
                      </div>
                      {testResults.data.analysis.compliance_summary
                        .negative_emotions_detected && (
                        <div className="text-xs text-orange-600 mt-1">
                          ⚠️ Negative emotions detected - Agent response
                          evaluation enhanced
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Overall Compliance Score:
                      </span>
                      <div className="text-right">
                        <span
                          className={`font-bold text-lg ${getAccuracyColor(
                            testResults.data.analysis.overall_compliance_score
                          )}`}
                        >
                          {testResults.data.analysis.overall_compliance_score}%
                        </span>
                        {testResults.expectedScore && (
                          <div className="text-xs text-gray-500">
                            Expected: {testResults.expectedScore}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Validation Results */}
      {validationResults && (
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Validation Results
          </h2>

          {validationResults.error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-md">
              <strong>Note:</strong> {validationResults.error}
              <div className="mt-2 text-sm">
                Run the validation script manually in your backend:
                <code className="block mt-1 p-2 bg-gray-100 rounded text-black">
                  cd backend && node scripts/validate-analysis.js
                </code>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {validationResults.emotionAccuracy}%
                </div>
                <div className="text-sm text-gray-500">Emotion Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {validationResults.complianceAccuracy}%
                </div>
                <div className="text-sm text-gray-500">Compliance Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {validationResults.averageResponseTime}ms
                </div>
                <div className="text-sm text-gray-500">Avg Response Time</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batch Test Results */}
      {batchTestResults && (
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Batch Emotion Test Results
          </h2>

          {batchTestResults.error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-md">
              <strong>Error:</strong> {batchTestResults.error}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-md">
                  <div className="text-2xl font-bold text-blue-600">
                    {batchTestResults.filter((r) => r.correct).length}/
                    {batchTestResults.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Correct Predictions
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-md">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      (batchTestResults.filter((r) => r.correct).length /
                        batchTestResults.length) *
                        100
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-md">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      (batchTestResults.reduce(
                        (sum, r) => sum + r.confidence,
                        0
                      ) /
                        batchTestResults.length) *
                        100
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Detailed Results
                </h3>
                {batchTestResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-md ${
                      result.correct
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{result.name}</span>
                      <span
                        className={`text-sm font-medium ${
                          result.correct ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {result.correct ? "✅ Correct" : "❌ Incorrect"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      "{result.text}"
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        Expected:{" "}
                        <span
                          className={`font-medium ${getEmotionColor(
                            result.expected
                          )}`}
                        >
                          {result.expected}
                        </span>
                        {" | "}
                        Got:{" "}
                        <span
                          className={`font-medium ${getEmotionColor(
                            result.result
                          )}`}
                        >
                          {result.result}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        {Math.round(result.confidence * 100)}% confidence
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emotion Category Breakdown */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Accuracy by Emotion
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {["joy", "anger", "sadness", "fear", "surprise", "love"].map(
                    (emotion) => {
                      const emotionTests = batchTestResults.filter(
                        (r) => r.expected === emotion
                      );
                      const correct = emotionTests.filter(
                        (r) => r.correct
                      ).length;
                      const accuracy =
                        emotionTests.length > 0
                          ? Math.round((correct / emotionTests.length) * 100)
                          : 0;

                      return (
                        <div
                          key={emotion}
                          className="text-center p-3 border border-gray-200 rounded-md"
                        >
                          <div
                            className={`text-lg font-bold ${getEmotionColor(
                              emotion
                            )}`}
                          >
                            {accuracy}%
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {emotion}
                          </div>
                          <div className="text-xs text-gray-500">
                            {correct}/{emotionTests.length}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestingDashboard;
