# Project Proposal: Speech Impairment Visualization

## Objective

To visualize speech patterns observed in children collected during their performance in a three distinct language tasks and their relationship with each child’s linguistic development. It aims to help recognize specific language impairments (SLI) in children from a visual representation of their interview data.

## Target application

Users of the application would be able to overlay and compare the correlation between different observed speech patterns and interview process phenomena and the SLI diagnosis.

## Dataset

**Diagnose Specific Language Impairment In Children**

Found here: [https://www.kaggle.com/dgokeeffe/specific-language-impairment](https://www.kaggle.com/dgokeeffe/specific-language-impairment)

The dataset contains aggregated interview data collected from children with and without an SLI diagnosis performing language processing and expression tasks. As for its specific contents, the dataset consists of three sub-datasets which were retrieved from the CHILDES (Child Language Data Exchange System) project: a sub-dataset of a sample of British adolescents, another from Canadian children aged 4 to 9, and another from U.S. children aged 4 to 12. 

## Users

The intended users of this visualization tool will be both professionals and non-professionals in the field of speech language pathology. These can include medical professionals and speech language pathologists as well as educators and parents. Users are not required to possess any specialist knowledge of the field of linguistics.  

## Tasks and rough description

* A dashboard displaying a set of visualizations to compare and contrast correlations of various combinations of relevant data fields and the SLI diagnosis 

* Users will be able to toggle and manipulate (sliders over the severity of the aspect) certain attributes such as "number of retracings", “ratio of raw inflected verbs” and “filler words” which will aid the user to understand the correlation between combinations of attribute and the diagnosis. Additionally, the tool will offer a genre of summative diagnosis statistic visualization with respect to the selected information

## Possible tools

The following set of tools may be used to plan, design, and possibly implement our solution. Note that implementation details such as target platforms are not fixed, thus this set of tools is not exhaustive. 

* **Microsoft Excel:** the spreadsheet application included in the Microsoft Office Suite. We will use Excel to perform initial aggregation on our dataset to retrieve only the information that are relevant to our solution.
* **Python Interpreter:** the interactive interpreter for the Python language. We may use Python to filter and retrieve relevant data.
* **D3.js:** a JavaScript library for manipulating documents based on data. We may use this library to display our visualization in the case that we develop a web application. 
* **Highcharts JS:** a JavaScript library for implementing interactive charts on web pages. We may integrate this library in our solution to provide an interactive chart interface to the user, assuming that we develop a web application. 

## Evaluation method

The evaluation of our final product will be conducted through usability testing. Our team will create a set of common tasks that a user may wish to complete and evaluate how effectively they are able to do so based on a number of metrics. These metrics can include the success and error rate, the user’s subjective satisfaction with the tool, as well as the time to complete the task.

We will additionally search for a similar tool which is also used for likelihood estimation of classification given certain parameters against which we can compare the relative efficacy of our design.

## Description of who will do what on the project

Our development plan has not yet been fully established. We plan for each member of the team to be involved in each stage of the project in order to have a full and complete understanding of the problem, our solution and its impact. The steps we have projected to proceed with are: interface design, data parsing, algorithm design, implementation, and testing.

