export const aimlConcepts = [
  {
    id: "aiml_fundamentals",
    num: "AI.1",
    title: "AI & ML Fundamentals",
    desc: "The core paradigms of modern cognitive computing. This section covers basic definitions, differences between AI/ML/DL, Narrow vs General AI, and the basic learning styles.",
    declaration: `// Conceptual Hierarchy of AI paradigms
const intelligenceHierarchy = {
  field: "Artificial Intelligence",
  subset: "Machine Learning (ML)",
  subSubset: "Deep Learning (DL)",
  application: "Generative AI (GenAI)"
};`,
    internalImplementation: `/* ----------------- INTEL PARADIGM HIERARCHY -----------------
   ┌──────────────────────────────────────────────┐
   │ ARTIFICIAL INTELLIGENCE (Broad Field)        │
   │   ┌────────────────────────────────────────┐  │
   │   │ MACHINE LEARNING (Learns from Data)    │  │
   │   │   ┌──────────────────────────────────┐ │  │
   │   │   │ DEEP LEARNING (Neural Networks)  │ │  │
   │   │   │   ┌────────────────────────────┐ │ │  │
   │   │   │   │ GENERATIVE AI (Creates)    │ │ │  │
   │   │   │   └────────────────────────────┘ │ │  │
   │   │   └──────────────────────────────────┘ │  │
   │   └────────────────────────────────────────┘  │
   └──────────────────────────────────────────────┘
*/`,
    subtopics: [
      {
        name: "Artificial Intelligence (AI)",
        oneLiner: "AI enables machines to simulate human intelligence to automate and improve decision-making at scale.",
        definition: "AI is the broad field of computer science dedicated to creating systems capable of performing tasks that typically require human intelligence, such as visual perception, speech recognition, decision-making, and language translation.",
        whyNeed: "Traditional rule-based systems scale poorly. AI allows systems to adapt to new inputs, identify complex patterns, and make decisions dynamically.",
        example: "Google Maps predicts traffic and calculates ETAs dynamically using historical trends and real-time user telemetry.",
        devPerspective: "SDEs integrate pre-built AI models (e.g. OpenAI or Gemini APIs) to add cognitive capabilities like semantic search, sentiment classification, or code summaries without building models from scratch.",
        questions: [
          "What is Artificial Intelligence and how does it differ from traditional programming?",
          "Can AI exist without Machine Learning?",
          "What are the major real-world applications and current limitations of AI?"
        ],
        followups: [
          "What is the difference between Narrow AI and Artificial General Intelligence (AGI)?",
          "Can AI make errors, and how should a system handle model failures?"
        ],
        confusions: [
          "AI vs ML: AI is the overall discipline of smart machines; ML is a specific branch of AI focused on learning from data."
        ],
        takeaways: [
          "AI is the parent container for ML and DL.",
          "Not all AI uses neural networks (e.g., expert search trees or heuristics are AI).",
          "SDEs interact with AI mainly via REST APIs and JSON wrappers."
        ]
      },
      {
        name: "AI vs ML vs Deep Learning",
        oneLiner: "AI is the goal, ML is the method of learning from data, and Deep Learning is the neural network technique.",
        definition: "AI is the general concept. Machine Learning is the subset where algorithms learn relationships from data without explicit coding. Deep Learning is the sub-subset using deep neural networks to automatically extract hierarchical features from unstructured inputs.",
        whyNeed: "Classic ML requires manual feature engineering (e.g. highlighting edge pixels in an image). Deep Learning learns these representations automatically, enabling image, video, and audio comprehension.",
        example: "AI is an automated customer desk; ML is classifying emails by keywords; Deep Learning is recognizing voice emotions in customer calls.",
        devPerspective: "For simple numerical/tabular business data, SDEs use traditional ML (like Random Forest). For complex text/image data, they use Deep Learning (Transformers and CNNs) through specialized runtime engines.",
        questions: [
          "Differentiate between AI, Machine Learning, and Deep Learning.",
          "When is traditional ML preferred over Deep Learning?",
          "Is deep learning always more accurate than traditional ML?"
        ],
        followups: [
          "What is the computational overhead difference between training a random forest vs a deep neural network?",
          "How does data volume dictate the choice between ML and DL?"
        ],
        confusions: [
          "Deep Learning vs Neural Networks: Deep Learning specifically refers to networks with many hidden layers ('deep' architectures)."
        ],
        takeaways: [
          "Traditional ML requires human feature extraction; DL extracts features automatically.",
          "DL requires significantly more data and specialized hardware (GPUs/TPUs) to converge.",
          "LLMs are deep learning transformer models."
        ]
      },
      {
        name: "Generative AI",
        oneLiner: "Generative AI creates new content (text, image, code) by modeling the probability distribution of training data.",
        definition: "A class of AI models that generate new, original content (text, code, images, audio, video) that resembles their training data rather than merely classifying or labeling existing inputs.",
        whyNeed: "Traditional AI is discriminative (e.g. predicting if an email is spam). Generative AI allows automated creation of code, text drafts, assets, and synthetic data, multiplying human productivity.",
        example: "GitHub Copilot translates code comments into full code blocks by predicting the next tokens in a file.",
        devPerspective: "SDEs use Generative AI APIs to build conversational interfaces, automate unit test drafting, construct document summarization pipelines, or generate mock data.",
        questions: [
          "What is Generative AI and how does it differ from discriminative ML?",
          "What is a foundation model?",
          "Explain the risks introduced by integrating Generative AI in software applications."
        ],
        followups: [
          "What is hallucination and why does it occur?",
          "How does temperature affect generative outputs?"
        ],
        confusions: [
          "GenAI vs LLMs: LLMs are a text-based subset of Generative AI, while GenAI also encompasses image (diffusion) and voice models."
        ],
        takeaways: [
          "Generative AI predicts/creates outputs; discriminative AI classifies inputs.",
          "Built on foundation models trained on massive, internet-scale datasets.",
          "Introduces challenges around security, consistency, copyright, and hallucination."
        ]
      },
      {
        name: "Narrow AI vs General AI (AGI)",
        oneLiner: "Narrow AI excels at a single dedicated task; AGI is hypothetical human-level intelligence across all domains.",
        definition: "Narrow AI is software optimized to solve a single target problem (e.g. translate language, flag credit card fraud). AGI is a theoretical system that can understand, learn, and apply knowledge dynamically across any cognitive task at human level.",
        whyNeed: "All active systems in industry are Narrow AI because they target specific automation values. AGI remains a research goal aimed at general problem solving.",
        example: "AlphaGo can beat grandmasters at Go (Narrow AI) but cannot schedule calendar invites or explain a joke.",
        devPerspective: "Every model an SDE deploys is Narrow AI. Even multi-modal LLMs are narrow systems that process statistical tokens rather than possessing generalized consciousness or reasoning.",
        questions: [
          "Explain the difference between Weak/Narrow AI and Strong/General AI (AGI).",
          "Is ChatGPT considered AGI?",
          "What criteria must an AI meet to be classified as AGI?"
        ],
        followups: [
          "What is Artificial Super Intelligence (ASI)?",
          "Why is general adaptability difficult for narrow models to achieve?"
        ],
        confusions: [
          "Versatile LLMs = AGI: Though LLMs can write poetry and code, they are still statistical prediction engines mapping inputs to outputs and lack general agency or domain-agnostic reasoning."
        ],
        takeaways: [
          "Every AI system in existence today is Narrow AI.",
          "AGI is a theoretical concept and future milestone.",
          "AGI requires cross-domain generalization, reasoning, and planning."
        ]
      },
      {
        name: "Supervised, Unsupervised, & Reinforcement Learning",
        oneLiner: "Supervised uses labels, Unsupervised finds hidden clusters, and Reinforcement learns via rewards.",
        definition: "Supervised Learning trains a model on labeled inputs to predict defined outputs. Unsupervised Learning finds patterns, associations, or groupings in unlabeled datasets. Reinforcement Learning trains an agent to make optimal decisions by maximizing cumulative rewards in an environment.",
        whyNeed: "Supervised handles standard prediction (classification/regression). Unsupervised handles discovery (customer segments). Reinforcement handles interactive tasks (robotics, game playing).",
        example: "Supervised: Classifying emails as spam. Unsupervised: Grouping similar buyers. Reinforcement: Training a drone to hover against wind.",
        devPerspective: "SDEs use supervised learning models for scoring risks, unsupervised (K-Means) for client segmentation, and reinforcement learning (RLHF) outputs when formatting prompt alignments.",
        questions: [
          "Compare Supervised, Unsupervised, and Reinforcement Learning.",
          "What is labeled vs unlabeled data?",
          "Give a real-world software engineering use case for each of the three paradigms."
        ],
        followups: [
          "How is reinforcement learning human feedback (RLHF) used to align LLMs?",
          "What are the target outputs in unsupervised algorithms?"
        ],
        confusions: [
          "Reinforcement vs Supervised: Supervised is told the exact correct answer. Reinforcement is given a reward score indicating how good or bad its action was."
        ],
        takeaways: [
          "Supervised needs human-labeled training data (most common in industry).",
          "Unsupervised finds patterns natively without label metadata.",
          "Reinforcement uses feedback loop cycles (Action, State, Reward)."
        ]
      },
      {
        name: "Training vs Inference",
        oneLiner: "Training is the model learning from data; inference is the model predicting on new data.",
        definition: "Training is the computational phase where a model learns weights by processing datasets and minimizing loss. Inference is the production phase where the pre-trained model executes to compute predictions on new, unseen data.",
        whyNeed: "Training requires massive distributed GPUs, TPUs, and hours/days. Inference requires low-latency, cost-effective computing to serve requests to active users in real-time.",
        example: "OpenAI spent months training GPT-4 on high-performance supercomputers. When you ask ChatGPT a question, it runs inference in seconds.",
        devPerspective: "SDEs spend 95% of their time on inference: optimizing latency, deploying models behind REST/gRPC endpoints, implementing semantic caches, and minimizing hosting costs.",
        questions: [
          "What is the difference between training and inference?",
          "Which phase is more computationally expensive at scale, and why?",
          "How does an SDE optimize inference latency for user applications?"
        ],
        followups: [
          "What is model quantization and how does it affect inference?",
          "What is cold start latency in serverless model deployment?"
        ],
        confusions: [
          "Retraining vs Inference: The model does not learn from client queries during normal inference. Its parameter weights remain static unless a retraining cycle is executed."
        ],
        takeaways: [
          "Training builds the model; inference runs the model.",
          "Training is batch-oriented and periodic; inference is interactive and constant.",
          "Inference optimizations include caching, pruning, and quantization."
        ]
      }
    ]
  },
  {
    id: "core_terminology",
    num: "AI.2",
    title: "Core ML Terminology",
    desc: "The essential vocabulary of machine learning. Learn the variables of models, dataset split practices, parameter adjustments, and training loop parameters.",
    declaration: `// Conceptual model variables
const trainingVariables = {
  inputs: "Features (e.g. square footage)",
  outputs: "Labels (e.g. house price)",
  internalLearned: "Parameters/Weights",
  externalSetup: "Hyperparameters (e.g. learning rate)"
};`,
    internalImplementation: `/* ----------------- ML VARIABLES & DATA LOOP -----------------
   ┌──────────────────────────────────────────────┐
   │ Dataset                                      │
   │  ├─ Features (Input columns x1, x2...)       │
   │  └─ Labels (Expected target y)               │
   └────────┬─────────────────────────────────────┘
            │  (Training Process)
   ┌────────▼─────────────────────────────────────┐
   │ Hyperparameters (Set by SDE: Epochs, LR...)  │
   │        │                                     │
   │   ┌────▼─────────────────────────────────┐   │
   │   │ Model Parameters (Weights, Biases)   │   │
   │   │  - Learned dynamically               │   │
   │   └──────────────────────────────────────┘   │
   └──────────────────────────────────────────────┘
*/`,
    subtopics: [
      {
        name: "Model, Dataset, Features, Labels",
        oneLiner: "Features are inputs, labels are correct answers, dataset is the data, model is the mathematical predictor.",
        definition: "Features are the individual variables used as inputs (x). Labels are the targets we want to predict (y). A Dataset is the collection of these inputs/targets. A Model is the mathematical formula that maps features to labels.",
        whyNeed: "Without clear features and labels, a model has no input space to evaluate and no target values to learn from during training ('garbage in, garbage out').",
        example: "Predicting user churn: Features = login frequency, age, plan type; Label = churned (Yes/No); Dataset = customer history logs.",
        devPerspective: "SDEs clean data pipelines, assemble features in database views, and format input objects into JSON payloads expected by inference models.",
        questions: [
          "Define Model, Dataset, Features, and Labels in a machine learning pipeline.",
          "What is feature engineering and why is it important?",
          "What is the difference between training, validation, and test datasets?"
        ],
        followups: [
          "How do you deal with missing feature values in production data streams?",
          "What is data leakage and how do you prevent it?"
        ],
        confusions: [
          "Features vs Labels: Features are what the model knows at prediction time; labels are what the model is trying to guess."
        ],
        takeaways: [
          "Data quality dictates model success.",
          "Feature engineering translates raw telemetry into model-usable columns.",
          "Keep training and test datasets strictly isolated."
        ]
      },
      {
        name: "Parameters vs Hyperparameters",
        oneLiner: "Parameters are learned by the model during training; hyperparameters are set by humans before training.",
        definition: "Parameters are internal configuration values (like weights and biases) that the model learns from the data. Hyperparameters are external settings (like learning rate, number of layers) set by engineers to guide the training process.",
        whyNeed: "Parameters determine how the model behaves on inputs. Hyperparameters control how the optimization algorithm works, determining training speed and model convergence.",
        example: "In a house-price equation (y = mx + c), 'm' and 'c' are parameters. The decision to use linear regression and training for 10 epochs are hyperparameters.",
        devPerspective: "When calling LLM APIs, parameters are fixed. SDEs use hyperparameters like 'temperature' or 'max_tokens' to tune the model's output generation style.",
        questions: [
          "What is the core difference between parameters and hyperparameters?",
          "Give three examples of hyperparameters in a deep learning context.",
          "How do you automate hyperparameter tuning?"
        ],
        followups: [
          "What is Grid Search vs Random Search for hyperparameter optimization?",
          "What does it mean when we say an LLM has '70 Billion parameters'?"
        ],
        confusions: [
          "Tuning parameters: You do not write code to tune parameters directly; they are updated automatically by optimizers during backpropagation."
        ],
        takeaways: [
          "Parameters = internal weights. Hyperparameters = external knobs.",
          "More parameters allow models to capture more complex patterns but require more memory.",
          "Hyperparameter configuration defines the training efficiency."
        ]
      },
      {
        name: "Epoch, Batch Size, & Learning Rate",
        oneLiner: "Epoch is passes of the dataset, Batch is items processed together, Learning Rate is step size.",
        definition: "An Epoch is one full pass of the entire dataset through the model. Batch Size is the number of samples processed before updating weights. Learning Rate is the scaling factor determining the step size taken towards minimizing the loss function.",
        whyNeed: "If the learning rate is too high, training becomes unstable and fails. If it is too low, training takes too long. Batch size balances memory limits and gradient accuracy.",
        example: "Training on 10,000 images: Batch size = 100 means the model updates weights 100 times per epoch. Learning rate = 0.001 controls the size of those updates.",
        devPerspective: "When fine-tuning models on platforms like Hugging Face or AWS Bedrock, SDEs configure these values to balance GPU VRAM usage and convergence speed.",
        questions: [
          "Explain Epoch, Batch Size, and Learning Rate.",
          "What are the implications of choosing a batch size that is too large or too small?",
          "How does learning rate affect the convergence of a loss function?"
        ],
        followups: [
          "What is a learning rate scheduler, and why is it useful?",
          "Why do larger batch sizes require more GPU VRAM?"
        ],
        confusions: [
          "High Learning Rate = Faster Training: A high learning rate does not guarantee faster convergence. It often causes the optimizer to overshoot the minimum loss, causing training to fail."
        ],
        takeaways: [
          "Epoch = total passes. Batch Size = step interval. Learning Rate = step size.",
          "Tuning these is crucial to prevent model underfitting or overfitting.",
          "Adam or SGD optimizers adjust learning rates dynamically."
        ]
      }
    ]
  },
  {
    id: "ml_basics",
    num: "AI.3",
    title: "Machine Learning Basics",
    desc: "Traditional algorithms used to analyze structured, tabular datasets. Covers linear models, tree-based models, and clustering algorithms.",
    declaration: `-- Traditional SQL classification mock logic
SELECT user_id,
       CASE WHEN credit_score > 700 AND income > 50000 THEN 'Low Risk'
            ELSE 'High Risk'
       END AS risk_tier
FROM bank_leads;`,
    internalImplementation: `/* ----------------- ML BASICS DECISION BOUNDARIES -----------------
   Linear Regression (Continuous)         Logistic Classification (Binary)
     y                                      y
     │       * /                            │  1  ┌───────────────
     │      * / *                           │     │    /
     │     * /                              │     │   /
     │    / *                               │     │  /
     │  */ *                                │     │ /
     └───────────────── x                   │  0 ─┘
                                            └───────────────── x
*/`,
    subtopics: [
      {
        name: "Linear vs Logistic Regression",
        oneLiner: "Linear regression predicts a number; logistic regression classifies into categories.",
        definition: "Linear Regression models the linear relationship between inputs and a continuous output. Logistic Regression uses the Sigmoid function to squish outputs into a probability between 0 and 1 to classify inputs into categories.",
        whyNeed: "Use Linear for forecasting values (prices, scores). Use Logistic for classifying outcomes (churn/not churn, fraud/not fraud).",
        example: "Linear: Predicting a driver's salary based on experience. Logistic: Predicting if a transaction is fraudulent.",
        devPerspective: "These models compile into lightweight, fast-executing functions. You can export their parameters directly and run inference inside a simple WebAssembly compiler or Node.js backend.",
        questions: [
          "What is the primary difference between Linear and Logistic Regression?",
          "Why is Logistic Regression classified as a classification algorithm despite its name?",
          "What is the role of the Sigmoid function in Logistic Regression?"
        ],
        followups: [
          "What is the mathematical equation of a linear regression model?",
          "What is the threshold value in logistic regression, and how do you tune it?"
        ],
        confusions: [
          "Linear vs Logistic output: Linear can output any positive or negative number; Logistic output is strictly bounded between 0 and 1."
        ],
        takeaways: [
          "Linear Regression predicts continuous numbers.",
          "Logistic Regression predicts probabilities for binary classification.",
          "Both assume linear relationships between features and output."
        ]
      },
      {
        name: "Decision Trees & Random Forests",
        oneLiner: "Decision tree uses split conditions; random forest aggregates many trees to reduce overfitting.",
        definition: "A Decision Tree splits data based on feature thresholds to reach a leaf node prediction. A Random Forest is an ensemble of many Decision Trees trained on random subsets of the data, averaging their outputs to reduce overfitting.",
        whyNeed: "Individual decision trees overfit data easily (learning noise). Random Forests solve this by using the 'wisdom of the crowd' to increase prediction stability.",
        example: "A bank deciding to grant a loan: Decision Tree splits on Credit > 700? -> Income > 50k? Random Forest uses 100 different trees to vote.",
        devPerspective: "Random Forests are robust baselines for tabular database data. SDEs can quickly train and deploy them using python libraries like Scikit-Learn.",
        questions: [
          "Explain how a Decision Tree makes a prediction.",
          "What is a Random Forest and how does it prevent overfitting?",
          "What is the concept of bagging (bootstrap aggregating)?"
        ],
        followups: [
          "What is entropy or Gini impurity in decision trees?",
          "How do tree-based models handle missing data compared to linear models?"
        ],
        confusions: [
          "Random Forest identical trees: The trees are not identical. Each tree is trained on a random sample of rows and a random subset of columns."
        ],
        takeaways: [
          "Decision Trees are highly interpretable but overfit easily.",
          "Random Forest is an ensemble method that reduces variance.",
          "Both handle non-linear relationships without scaling features."
        ]
      },
      {
        name: "SVM, Naive Bayes, & KNN",
        oneLiner: "SVM finds a boundary, Naive Bayes uses probability, KNN looks at nearest data neighbors.",
        definition: "SVM finds the hyperplane that maximizes the margin between classes. Naive Bayes is a probabilistic classifier based on Bayes' Theorem, assuming feature independence. KNN classifies a point based on the majority class of its nearest neighbors.",
        whyNeed: "SVM handles high-dimensional margins. Naive Bayes is extremely fast for text filtering. KNN is simple and requires no training phase.",
        example: "SVM: Detecting anomalies. Naive Bayes: Gmail spam sorting. KNN: Finding matching profiles for users.",
        devPerspective: "Naive Bayes is useful for simple text classification (like routing customer support tickets) due to its speed and low memory footprint in serverless functions.",
        questions: [
          "What are the core concepts of SVM, Naive Bayes, and KNN?",
          "Why is Naive Bayes described as 'naive'?",
          "What is the impact of the 'K' parameter in KNN?"
        ],
        followups: [
          "What is the Kernel Trick in Support Vector Machines?",
          "Why does KNN perform poorly on large datasets during inference?"
        ],
        confusions: [
          "KNN vs K-Means: KNN is supervised classification (requires labels); K-Means is unsupervised clustering (no labels)."
        ],
        takeaways: [
          "SVM maximizes boundaries using support vectors.",
          "Naive Bayes assumes features do not influence each other.",
          "KNN is a distance-based, lazy learner (calculates relationships at query time)."
        ]
      },
      {
        name: "K-Means Clustering & PCA",
        oneLiner: "K-Means groups data into clusters; PCA reduces dimensions to compress features.",
        definition: "K-Means is an unsupervised algorithm that groups data points into K clusters. PCA (Principal Component Analysis) is a dimensionality reduction technique that simplifies datasets by projecting them onto fewer orthogonal dimensions (principal components).",
        whyNeed: "K-Means groups customers by behavior without labels. PCA reduces features to speed up models and resolve the 'curse of dimensionality'.",
        example: "K-Means: Spotify clustering users into music taste profiles. PCA: Reducing 100 user features down to 3 components to plot on a graph.",
        devPerspective: "PCA is a common pre-processing step to compress feature vectors before storing them in database tables or using them in latency-sensitive models.",
        questions: [
          "What is K-Means clustering and how does it find centroids?",
          "What is PCA and why is it used for feature compression?",
          "How do you determine the optimal number of clusters in K-Means?"
        ],
        followups: [
          "What is the Elbow Method and how does it evaluate within-cluster variance?",
          "Does PCA lose data during the compression process?"
        ],
        confusions: [
          "PCA as feature selection: PCA does not pick a subset of existing columns. It creates new variables that are linear combinations of the old ones."
        ],
        takeaways: [
          "K-Means groups unlabeled data by distance metrics.",
          "PCA projects data to fewer dimensions while retaining variance.",
          "Both are unsupervised methods."
        ]
      }
    ]
  },
  {
    id: "deep_learning",
    num: "AI.4",
    title: "Deep Learning",
    desc: "The architecture of neural networks. Explore how nodes propagate data, how error gradients guide learning, and the design of CNNs, RNNs, and Transformers.",
    declaration: `// Deep learning activation representations
const activations = {
  relu: (x) => Math.max(0, x),
  sigmoid: (x) => 1 / (1 + Math.exp(-x)),
  softmax: (arr) => {
    const exps = arr.map(Math.exp);
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  }
};`,
    internalImplementation: `/* ----------------- TRANSFORMER ATTENTION DATA FLOW -----------------
   Input Tokens ──► [Positional Encoding] ──► [Self-Attention Grid]
                                                      │ (Multi-Head Weighing)
                                                      ▼
   Output Tokens ◄── [Feed Forward Network] ◄── [Layer Norm / Add]
*/`,
    subtopics: [
      {
        name: "Neural Networks & Activation Functions",
        oneLiner: "Neural networks process features through layers; activations introduce non-linearity.",
        definition: "A Neural Network is a network of layers of nodes. Activation Functions (like ReLU, Sigmoid, Softmax) introduce non-linear math to these nodes, allowing the network to learn complex patterns.",
        whyNeed: "Without activation functions, a neural network is just a giant linear model, incapable of learning complex patterns like curves or image shapes.",
        example: "Image classifiers use hidden ReLU activations to identify textures and a Softmax activation at the end to output category probabilities.",
        devPerspective: "SDEs choose the output activation based on the task: Sigmoid for binary choices (0 or 1), Softmax for picking one of many categories, and Linear for predicting numbers.",
        questions: [
          "Describe the basic architecture of a Neural Network.",
          "Why are activation functions necessary?",
          "Explain ReLU, Sigmoid, and Softmax."
        ],
        followups: [
          "What is the mathematical equation of a single artificial neuron?",
          "What is the vanishing gradient problem and how does ReLU mitigate it?"
        ],
        confusions: [
          "Sigmoid vs Softmax: Use Sigmoid to predict a single probability (e.g. Yes/No). Use Softmax to predict probabilities across multiple distinct choices (e.g. Cat, Dog, or Bird) that sum to 1.0."
        ],
        takeaways: [
          "Nodes pass values through weighted links.",
          "Activations add non-linearity to the network.",
          "ReLU is the standard hidden layer activation."
        ]
      },
      {
        name: "Forward & Backpropagation with Gradient Descent",
        oneLiner: "Forward pass predicts, backpropagation computes error gradients, gradient descent updates weights.",
        definition: "Forward propagation sends input data forward to make a prediction. Backpropagation computes the gradients of the loss function with respect to weights using the chain rule. Gradient Descent uses these gradients to update the weights and minimize error.",
        whyNeed: "This feedback loop is how a neural network learns. Without backpropagation, there is no way to calculate how to adjust weights to improve predictions.",
        example: "Like a driver making a turn, seeing they went too wide (forward pass + error), and adjusting their steering angle for the next turn (backprop + gradient descent).",
        devPerspective: "Deep learning models are trained on GPUs because forward/backpropagation involves large matrix multiplications that run much faster in parallel.",
        questions: [
          "Walk through the process of forward and backpropagation.",
          "What is the role of Gradient Descent in training neural networks?",
          "What is the difference between gradients and weights?"
        ],
        followups: [
          "How does Stochastic Gradient Descent (SGD) differ from Batch Gradient Descent?",
          "What is the chain rule in calculus and how is it used in backpropagation?"
        ],
        confusions: [
          "Backpropagation vs Gradient Descent: Backprop only calculates the gradients (tells you which way is downhill); Gradient Descent actually updates the weights (takes the step downhill)."
        ],
        takeaways: [
          "Forward pass predicts; backpropagation computes updates.",
          "Loss functions evaluate prediction error.",
          "Gradient descent minimizes the loss function step-by-step."
        ]
      },
      {
        name: "CNNs, RNNs, & LSTMs",
        oneLiner: "CNNs process spatial images; RNNs/LSTMs process sequential text and time series.",
        definition: "CNNs (Convolutional Neural Networks) use filters to detect spatial patterns in grid data like images. RNNs (Recurrent Neural Networks) process sequential data by maintaining a hidden memory state. LSTMs are improved RNNs that capture long-term dependencies without forgetting.",
        whyNeed: "Standard networks lose image structures and text sequence order. CNNs preserve spatial relationships in images. RNNs/LSTMs track time and text sequence order.",
        example: "CNN: Apple FaceID scanning facial structure. LSTM: Apple Keyboard predicting the next word you type.",
        devPerspective: "For sequential backend work like log analysis or request forecasting, LSTMs are useful. For image processing, CNNs are deployed in serverless functions.",
        questions: [
          "Compare CNNs, RNNs, and LSTMs.",
          "How does a convolution operation extract features from an image?",
          "What problem do LSTMs solve in standard RNN architectures?"
        ],
        followups: [
          "What is pooling in CNNs and why is it used?",
          "What are the gates in an LSTM cell and what do they do?"
        ],
        confusions: [
          "RNN sequence limits: Standard RNNs have a very short memory. They suffer from vanishing gradients, meaning they forget earlier words in a sentence, which is why LSTMs are used."
        ],
        takeaways: [
          "CNNs are optimized for image/spatial grid data.",
          "RNNs/LSTMs are designed for sequences and time-series data.",
          "LSTMs use gates to retain long-term memory."
        ]
      },
      {
        name: "Transformers & Self-Attention",
        oneLiner: "Transformers process entire sequences in parallel using self-attention, replacing sequential models.",
        definition: "A Transformer is a neural network architecture that processes sequences in parallel. It uses Self-Attention to weigh the relationships between all words in a sentence simultaneously, regardless of their distance.",
        whyNeed: "RNNs/LSTMs process words one-by-one, which is slow and cannot be parallelized. Transformers process all words at once, enabling training on massive datasets.",
        example: "GPT-4 and Gemini are built on the Transformer architecture. The 'T' in GPT stands for 'Transformer'.",
        devPerspective: "Because Transformers run in parallel, they leverage modern GPU clusters efficiently. This architectural shift is what enabled the scale of modern foundation models.",
        questions: [
          "What is a Transformer and why has it overtaken RNNs in NLP?",
          "What is the Self-Attention mechanism?",
          "What is the role of positional encoding in Transformers?"
        ],
        followups: [
          "Explain the difference between the encoder and decoder parts of a Transformer.",
          "What does multi-head attention do?"
        ],
        confusions: [
          "Transformer vs LLM: The Transformer is the underlying neural network architecture; an LLM is a large language model built using that architecture."
        ],
        takeaways: [
          "Transformers process sequences in parallel, enabling rapid GPU training.",
          "Self-attention allows tokens to focus on relevant context words dynamically.",
          "Foundation of modern LLMs (GPT, LLaMA, Claude, Gemini)."
        ]
      }
    ]
  },
  {
    id: "llms_deep",
    num: "AI.5",
    title: "Large Language Models (LLMs)",
    desc: "The mechanics of text generation models. Understand tokens, context windows, sampling variables, training phases, and architectural concepts like Mixture of Experts.",
    declaration: `// Simulated Token & Temperature sampling
function sampleNextToken(tokenProbabilities, temperature) {
  // Squish probabilities using temperature
  const logits = tokenProbabilities.map(p => Math.log(p) / temperature);
  const exps = logits.map(Math.exp);
  const sum = exps.reduce((a, b) => a + b, 0);
  const softmaxProbs = exps.map(e => e / sum);
  return selectWeightedIndex(softmaxProbs);
}`,
    internalImplementation: `/* ----------------- LLM TRAINING STAGES Pipeline -----------------
   ┌────────────────────────────────────────────────────────┐
   │ 1. PRE-TRAINING (Unsupervised text prediction)        │
   │    - Learns syntax, facts, and general knowledge        │
   └────────┬───────────────────────────────────────────────┘
            ▼
   ┌────────────────────────────────────────────────────────┐
   │ 2. INSTRUCTION TUNING (Supervised: Q&A formatting)     │
   │    - Aligns model to respond to direct prompts         │
   └────────┬───────────────────────────────────────────────┘
            ▼
   ┌────────────────────────────────────────────────────────┐
   │ 3. RLHF ALIGNMENT (Reinforcement with Human Feedback)  │
   │    - Fine-tunes model for safety and helpfulness       │
   └────────────────────────────────────────────────────────┘
*/`,
    subtopics: [
      {
        name: "What is an LLM?",
        oneLiner: "An LLM is a giant transformer model trained on massive text to predict the next word in a sequence.",
        definition: "A Large Language Model is a deep learning model with billions of parameters, trained on internet-scale text data to predict the next token in a sequence, allowing it to generate human-like text.",
        whyNeed: "Instead of building separate models for translation, sentiment analysis, and coding, one LLM can perform all these tasks through natural language prompts.",
        example: "GPT-4, Gemini, Claude, and LLaMA are general-purpose LLMs.",
        devPerspective: "SDEs design workflows around LLM constraints: managing API rate limits, handling output parsing formats (like forcing JSON mode), and managing user session context.",
        questions: [
          "What is a Large Language Model (LLM) and how does it generate text?",
          "What does it mean for a model to be auto-regressive?",
          "What are the main limitations of modern LLMs?"
        ],
        followups: [
          "How does an LLM project raw token outputs to vocabulary probabilities?",
          "Why do LLMs struggle with basic logic or math puzzles natively?"
        ],
        confusions: [
          "LLMs contain a database: LLMs do not search the internet or query a database when answering. They rely on patterns stored in their weights, which is why they can state facts confidently but incorrectly."
        ],
        takeaways: [
          "LLMs are next-token predictors.",
          "They are general-purpose processors, not search databases.",
          "Hosted as API microservices for application development."
        ]
      },
      {
        name: "Token & Context Window",
        oneLiner: "Tokens are text fragments processed by models; context window is the memory capacity per request.",
        definition: "A Token is a character fragment processed by an LLM (100 words ~ 130 tokens). The Context Window is the maximum number of tokens the model can process in a single request/response cycle.",
        whyNeed: "LLMs have hardware-bounded attention limits. The context window determines how much prompt text, history, and retrieved document context you can send in an API call.",
        example: "GPT-4 has a 128k context window (approx. 90,000 words); Claude 3.5 has a 200k context window.",
        devPerspective: "SDEs manage context windows by implementing conversation pruning, text summarization, and vector retrieval (RAG) to only send the most relevant tokens, saving API costs.",
        questions: [
          "What is a token, and how does tokenization work?",
          "What is a context window and why is it a constraint for developers?",
          "What is the needle-in-a-haystack test for LLMs?"
        ],
        followups: [
          "Why is token-based billing standard for AI APIs?",
          "What is the difference between word-level, character-level, and sub-word tokenization?"
        ],
        confusions: [
          "Tokens equal words: 1 token does not equal 1 word. Sub-word tokenizers split common words into fragments. E.g., 'pre-training' might be split into 'pre', '-', and 'training'."
        ],
        takeaways: [
          "Tokens are character fragments analyzed by models.",
          "Context window is the memory limit for active prompts.",
          "Larger context windows cost more in latency and fees."
        ]
      },
      {
        name: "Temperature, Top-K, & Top-P",
        oneLiner: "Parameters that control LLM output randomness: Temperature squishes logits, Top-P/K limit choices.",
        definition: "Hyperparameters that filter token probability distributions. Temperature controls randomness (higher = more creative, lower = deterministic). Top-K limits choices to the top K tokens. Top-P (nucleus sampling) limits choices to a pool whose cumulative probability meets threshold P.",
        whyNeed: "For coding or SQL generation, you want low temperature (0.0) for accuracy. For creative writing, you want high temperature (0.7+) for variety.",
        example: "Setting temperature = 0.0 in an OpenAI API call to ensure a chatbot outputs consistent, repeatable support answers.",
        devPerspective: "For structured outputs like JSON data parsing, SDEs lock the temperature to 0.0 and apply JSON-schema mode to prevent syntax errors.",
        questions: [
          "Explain the roles of Temperature, Top-K, and Top-P in LLM generation.",
          "When would you configure a temperature of 0.0 vs 0.8?",
          "How does nucleus sampling (Top-P) differ from Top-K?"
        ],
        followups: [
          "What are logits in the final projection layer of an LLM?",
          "What happens if you combine high Temperature and low Top-P?"
        ],
        confusions: [
          "Temperature changes model facts: Temperature does not make the model smarter. It only changes how randomly it selects words from its top candidates."
        ],
        takeaways: [
          "Temperature = output randomness.",
          "Top-K = absolute count filter.",
          "Top-P = cumulative probability filter.",
          "Always set temperature = 0 for structured coding/JSON tasks."
        ]
      },
      {
        name: "Hallucination",
        oneLiner: "Hallucination is when an LLM generates factually incorrect text with high confidence.",
        definition: "Hallucination occurs when a model generates outputs that are factually incorrect or unsupported by its training data, presenting them with high confidence.",
        whyNeed: "LLMs are statistical sequence generators, not databases. They output what is grammatically plausible, which sometimes results in false facts.",
        example: "An LLM listing fake legal case citations that sound realistic when asked to write a legal brief.",
        devPerspective: "SDEs reduce hallucinations by using RAG (retrieval-augmented generation), applying system prompt constraints ('Answer only using the provided text'), and validating outputs.",
        questions: [
          "What is an LLM hallucination and why does it occur?",
          "How can a software developer reduce hallucinations in a production application?",
          "Can hallucinations be completely eliminated in generative models?"
        ],
        followups: [
          "How does temperature scaling affect hallucination rates?",
          "What is self-consistency checking as a validation step?"
        ],
        confusions: [
          "Hallucination is a model bug: Hallucination is not a bug; it is an inherent property of next-token prediction. The model is always predicting, it has no native concept of 'truth'."
        ],
        takeaways: [
          "Hallucination is a side-effect of next-token probability prediction.",
          "Models have no native concept of truth.",
          "Reduce hallucinations by grounding prompts with retrieved context (RAG)."
        ]
      },
      {
        name: "Pre-training, Fine-tuning, & Alignment",
        oneLiner: "Pre-training learns general language; fine-tuning fits specific tasks; alignment sets safety limits.",
        definition: "Pre-training is training a model on raw text to learn general grammar and facts. Fine-tuning adjusts the weights on a specific dataset (like customer support logs). Alignment (RLHF) optimizes the model to follow instructions safely.",
        whyNeed: "Pre-trained models are raw text-completion engines. Instruction tuning and RLHF are required to transform them into helpful assistants.",
        example: "Base model: 'The capital of France is...' -> pre-trained completion. Chat assistant: 'What is the capital of France?' ->Aligned reply.",
        devPerspective: "SDEs use pre-trained models via APIs, sometimes fine-tuning them on private schema datasets to teach specific formatting styles or custom internal APIs.",
        questions: [
          "Explain the steps to build a production-ready LLM: Pre-training, Fine-tuning, and Alignment.",
          "What is RLHF and what role does it play in alignment?",
          "When should you fine-tune a model vs using prompt engineering?"
        ],
        followups: [
          "What is LoRA (Low-Rank Adaptation) for parameter-efficient fine-tuning?",
          "What is the role of a reward model in Reinforcement Learning from Human Feedback?"
        ],
        confusions: [
          "Fine-tuning teaches new facts: Fine-tuning is poor at teaching new facts (which causes hallucination). It is used to teach models new formats, tones, or specific task behaviors."
        ],
        takeaways: [
          "Pre-training is unsupervised and compute-heavy.",
          "Instruction tuning and RLHF align models for conversational use.",
          "Use RAG to teach new facts; use fine-tuning to change behavior."
        ]
      },
      {
        name: "Quantization, Distillation, & Mixture of Experts (MoE)",
        oneLiner: "Quantization lowers weight precision, Distillation transfers knowledge, MoE routes prompts to sub-specialists.",
        definition: "Quantization converts model weights to lower-precision data formats (e.g. 16-bit float to 4-bit integer) to run on smaller GPUs. Distillation trains a smaller 'student' model to copy a larger 'teacher'. MoE (Mixture of Experts) routes queries dynamically to specialized sub-networks, activating only a fraction of the total parameters per token.",
        whyNeed: "Full-scale models are expensive to host. Quantization and distillation reduce deployment costs. MoE speeds up inference by avoiding running the entire network for every query.",
        example: "Mixtral 8x7B uses MoE to route code queries to a coding expert network and French translation to a translation expert network.",
        devPerspective: "To run models locally on devices or in cost-sensitive servers, SDEs deploy quantized models (e.g. GGUF format) which run on standard CPU/RAM hardware.",
        questions: [
          "What are Quantization and Knowledge Distillation?",
          "How does a Mixture of Experts (MoE) architecture work?",
          "What are the trade-offs of using quantized models?"
        ],
        followups: [
          "What is the difference between float16 and int4 weights in model memory sizes?",
          "What is the role of the gating network in an MoE model?"
        ],
        confusions: [
          "MoE model active parameters: An MoE model with 40 Billion parameters does not use all 40B parameters per query. It might only activate 12 Billion parameters per token, reducing compute costs."
        ],
        takeaways: [
          "Quantization compresses weight memory sizes.",
          "Distillation transfers performance to smaller models.",
          "MoE routes tokens dynamically to active experts, saving runtime compute."
        ]
      }
    ]
  },
  {
    id: "embeddings_db",
    num: "AI.6",
    title: "Embeddings & Vector Databases",
    desc: "How unstructured data is mapped mathematically. Learn about high-dimensional vector representations, semantic similarity searches, index designs, and popular databases.",
    declaration: `// Vector Cosine Similarity implementation
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}`,
    internalImplementation: `/* ----------------- RAG VECTOR DB PIPELINE -----------------
   Input Query ──► [Embedding API] ──► Query Vector [0.15, -0.84...]
                                              │
                                              ▼ (ANN Vector Search)
   Relevance Match ◄── [Document Context] ◄── [Vector Index (HNSW/IVF)]
*/`,
    subtopics: [
      {
        name: "What is an Embedding?",
        oneLiner: "An Embedding is a vector of numbers representing the semantic meaning of a piece of data.",
        definition: "An Embedding is a low-dimensional, dense vector representation of unstructured data (text, image, audio) generated by a model. It maps semantic meaning into a geometric coordinate space where similar concepts are grouped close together.",
        whyNeed: "Computers cannot compare the meaning of words directly. Representing words as vectors allows you to calculate their semantic similarity mathematically.",
        example: "The vector for 'King' minus 'Man' plus 'Woman' resolves close to the vector for 'Queen'.",
        devPerspective: "SDEs use embedding APIs to convert text inputs into vector arrays (e.g. 1536 floats) and store them in database indexes to implement search functionality.",
        questions: [
          "What is an embedding and how does it represent semantic meaning?",
          "How is vector distance used to evaluate similarity?",
          "What are the differences between sparse and dense vectors?"
        ],
        followups: [
          "Explain Cosine Similarity vs Dot Product vs Euclidean Distance.",
          "How do models ensure that synonyms map close together in vector space?"
        ],
        confusions: [
          "Embeddings are simple hashes: Embeddings are not hashes. A hash function generates distinct strings for similar inputs (e.g. 'cat' vs 'cats'). Embedding models generate similar vector values for similar meanings."
        ],
        takeaways: [
          "Embeddings convert meaning into numerical coordinate vectors.",
          "Distance in coordinate space represents semantic similarity.",
          "Used in semantic search, recommendations, and RAG pipelines."
        ]
      },
      {
        name: "Vector Databases & ANN Search",
        oneLiner: "Vector databases index and search high-dimensional vectors using Approximate Nearest Neighbor (ANN) algorithms.",
        definition: "A Vector Database is a storage engine optimized to store, index, and query vector embeddings. It uses Approximate Nearest Neighbor (ANN) search algorithms to query millions of high-dimensional vectors with low latency.",
        whyNeed: "Standard SQL databases struggle to compare high-dimensional vectors efficiently. Vector databases use specialized indexes to search millions of vectors in milliseconds.",
        example: "Using Pinecone or Milvus to quickly retrieve the top 3 document chunks relevant to a user's question.",
        devPerspective: "SDEs choose vector databases based on project needs: lightweight local libraries (like ChromaDB or FAISS) for development, or distributed databases (like Pinecone, Milvus, or pgvector) for production scale.",
        questions: [
          "What is a Vector Database and why is it needed?",
          "Explain Approximate Nearest Neighbor (ANN) search.",
          "Compare pgvector, Pinecone, ChromaDB, and FAISS."
        ],
        followups: [
          "How do HNSW (Hierarchical Navigable Small World) indexes speed up search queries?",
          "What is IVF (Inverted File Index) and how does it partition vector space?"
        ],
        confusions: [
          "Exact match vs ANN: Vector databases do not search every record to return exact matches. They trade a small amount of accuracy for performance, returning approximate nearest matches in log-time."
        ],
        takeaways: [
          "Vector databases index high-dimensional embeddings.",
          "ANN algorithms enable sub-second vector queries.",
          "Crucial infrastructure for RAG and semantic search systems."
        ]
      }
    ]
  },
  {
    id: "rag_agents",
    num: "AI.7",
    title: "RAG & AI Agents",
    desc: "Modern AI application architectures. Understand Retrieval-Augmented Generation (RAG) pipelines, semantic retrieval, and agentic workflows.",
    declaration: `// Simulated RAG prompt compilation
function buildAugmentedPrompt(userQuery, retrievedContextChunks) {
  return \`Use the following context to answer the query:
---
CONTEXT:
\${retrievedContextChunks.join('\\n\\n')}
---
QUERY: \${userQuery}
Answer:\`;
}`,
    internalImplementation: `/* ----------------- AI AGENT LOOP ARCHITECTURE -----------------
   User Goal ──► [Agent Planner] ──► [Tools Selection (API/DB)]
                       ▲                      │
                       │                      ▼ (Execution)
                [Evaluate Output] ◄── [Observation State]
*/`,
    subtopics: [
      {
        name: "RAG (Retrieval-Augmented Generation)",
        oneLiner: "RAG retrieves relevant database context to ground LLM prompts, reducing hallucinations.",
        definition: "RAG is an architectural pattern that retrieves relevant documents from an external data source and injects them into the LLM prompt context to ground the model's generated answer in factual data.",
        whyNeed: "LLMs have cut-off dates and lack access to private corporate data. RAG connects the LLM to live databases and documents without the high cost of model retraining.",
        example: "A customer support bot: User asks 'What is my order status?' -> RAG queries database -> Injects order details into prompt -> LLM drafts reply.",
        devPerspective: "SDEs build RAG pipelines by chunking documents, generating embeddings, querying vector databases, compiling prompt templates, and streaming final LLM responses.",
        questions: [
          "What is Retrieval-Augmented Generation (RAG) and how does the pipeline work?",
          "Compare RAG vs Fine-Tuning for adapting an LLM to domain-specific knowledge.",
          "How do you evaluate and optimize a RAG system's retrieval quality?"
        ],
        followups: [
          "What is semantic chunking and how does it preserve context compared to character splitting?",
          "Explain the roles of a retriever and a generator in RAG."
        ],
        confusions: [
          "RAG retrains the model: RAG does not change the model's weights. It simply passes context information in the prompt, relying on the model's in-context learning to draft answers."
        ],
        takeaways: [
          "RAG connects LLMs to dynamic external databases.",
          "Grounds prompts with retrieved context to reduce hallucinations.",
          "Significantly cheaper and easier to update than fine-tuning."
        ]
      },
      {
        name: "AI Agents",
        oneLiner: "An AI Agent is an LLM configured with memory and tools to plan and execute tasks autonomously.",
        definition: "An AI Agent is a system where an LLM acts as an engine that plans tasks, maintains state memory, and calls external tools (APIs, databases, browsers) autonomously to achieve a target goal.",
        whyNeed: "Standard LLMs are static text-completion systems. AI Agents can interact with external systems, review their own actions, and execute multi-step workflows to solve problems.",
        example: "An AI coding agent that reads a bug report, searches a codebase, edits files, runs local tests, and submits a pull request.",
        devPerspective: "SDEs build agents using frameworks like LangChain or CrewAI, exposing tools (as annotated JSON functions) that the agent can choose to execute via tool-calling loops.",
        questions: [
          "What is an AI Agent and how does it differ from a standard chatbot?",
          "What are the main components of an agentic architecture (planning, memory, tools)?",
          "Explain Multi-Agent systems and how they coordinate tasks."
        ],
        followups: [
          "What is the ReAct (Reason + Action) loop pattern in agent design?",
          "What is the difference between short-term (in-context) and long-term memory for agents?"
        ],
        confusions: [
          "Agent determinism: Agents are non-deterministic. Because they use LLMs to decide their next steps, they can get stuck in loops or call incorrect tools if the prompt design is not robust."
        ],
        takeaways: [
          "Agents plan actions and use external tools autonomously.",
          "Common agent components: LLM, Planning, Memory, Tools.",
          "SDEs expose tools as JSON schemas for the agent to call."
        ]
      }
    ]
  },
  {
    id: "system_deployment",
    num: "AI.8",
    title: "Deployment & System Design",
    desc: "How to deploy AI systems in production. Covers APIs, frameworks, prompt engineering, deployment options, and AI system design patterns.",
    declaration: `// Conceptual AI System Flow
const systemDeploymentLayout = {
  frontend: "Vite + React UI client",
  middleware: "FastAPI semantic rate limiter & cache",
  vectorDb: "pgvector cluster (document chunks)",
  modelHost: "Ollama locally or AWS Bedrock cloud"
};`,
    internalImplementation: `/* ----------------- SEMANTIC CACHE PIPELINE -----------------
   Query ──► [Embeddings API] ──► Vector Lookup
                                      │
                       ┌──────────────┴──────────────┐
                       ▼ (Match found > 0.96)        ▼ (No match)
                 [Return Cached JSON]          [Call LLM API] ──► Save Cache
*/`,
    subtopics: [
      {
        name: "Prompt Engineering",
        oneLiner: "Prompt Engineering is the practice of structuring inputs to guide LLM outputs accurately.",
        definition: "Prompt Engineering is the process of structuring, framing, and formatting inputs to guide generative models to output accurate, structured, and helpful responses.",
        whyNeed: "LLMs are sensitive to prompt phrasing. Applying structured prompting patterns ensures the model returns data in the correct format with fewer errors.",
        example: "Using Chain-of-Thought prompting ('Think step-by-step before answering') to improve the model's accuracy on logic tasks.",
        devPerspective: "SDEs embed system prompts, user variables, and formatting schemas into templates to guarantee consistent model outputs.",
        questions: [
          "What is Prompt Engineering and why is it important?",
          "Compare Zero-shot, One-shot, and Few-shot prompting.",
          "What is Chain-of-Thought (CoT) prompting?"
        ],
        followups: [
          "What is Role Prompting and how does it affect model generation?",
          "How do you implement guardrails to prevent prompt injection attacks?"
        ],
        confusions: [
          "Prompting replaces code: Prompt engineering does not replace application logic. It works alongside code to handle text transformation and generation steps."
        ],
        takeaways: [
          "Prompts guide token generation behavior.",
          "Few-shot prompting provides examples to specify formatting.",
          "Chain-of-Thought improves reasoning accuracy."
        ]
      },
      {
        name: "AI APIs & Frameworks",
        oneLiner: "APIs connect applications to hosted models; frameworks like LangChain simplify orchestrating these calls.",
        definition: "APIs (OpenAI, Gemini, Anthropic) provide access to hosted models. Frameworks (LangChain, LlamaIndex) are libraries that simplify building AI pipelines, handling prompt templates, memory, and tool integration.",
        whyNeed: "Writing raw HTTP requests for complex multi-turn chats, vector lookups, and tool calls is repetitive. Frameworks provide reusable components to build these pipelines.",
        example: "Using LlamaIndex to connect a folder of PDF manuals to an API chatbot in few lines of code.",
        devPerspective: "While frameworks speed up initial development, SDEs should evaluate when to use direct API calls to keep production code simple and reduce dependencies.",
        questions: [
          "What are the main AI model APIs and frameworks available to developers?",
          "Compare LangChain and LlamaIndex.",
          "What are the pros and cons of using an orchestration framework?"
        ],
        followups: [
          "How do you handle API rate limits and token usage quotas in production?",
          "What is Hugging Face and how is it used by developers?"
        ],
        confusions: [
          "Frameworks are required: You do not need LangChain to build LLM apps. For simple tasks, direct API calls to OpenAI or Anthropic are often easier to maintain."
        ],
        takeaways: [
          "APIs expose models; frameworks orchestrate workflows.",
          "LangChain is general-purpose; LlamaIndex is data-retrieval focused.",
          "Evaluate dependencies before using heavy orchestration libraries in production."
        ]
      },
      {
        name: "Model Deployment & System Design",
        oneLiner: "System design for scaling model inference using semantic caches, rate limiters, and quantization.",
        definition: "AI System Design covers the architecture of deploying models at scale. It includes selecting deployment options (local vs cloud), optimizing inference (using semantic caches), and implementing security guardrails.",
        whyNeed: "Running models is expensive and slow. Designing pipelines with semantic caches and rate limiters reduces costs, manages latency, and protects backend resources.",
        example: "Designing an enterprise RAG system with a Redis semantic cache that stores past query-response pairs, bypassing the LLM API for duplicate questions.",
        devPerspective: "SDEs design the infrastructure around models: setting up queue pipelines for batch inference, configuring load balancers, and securing API endpoints.",
        questions: [
          "How would you design a scalable document Q&A system (RAG) for an enterprise?",
          "What is a semantic cache and how does it save costs?",
          "Compare hosting open-source models (like LLaMA) on cloud servers vs using serverless APIs (like Anthropic)."
        ],
        followups: [
          "What is GPU cold start latency and how do you mitigate it?",
          "How do you implement rate limiting for users requesting LLM tokens?"
        ],
        confusions: [
          "Models match database scaling: Models cannot be scaled like traditional stateless web servers. Model inference is highly compute-intensive, requiring specialized GPU load balancing."
        ],
        takeaways: [
          "Semantic caching reduces model API costs.",
          "Scale compute using specialized GPU clusters or serverless API keys.",
          "RAG pipelines require monitoring both retrieval and generation quality."
        ]
      }
    ]
  }
];
