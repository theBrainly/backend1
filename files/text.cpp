#include <iostream>
#include <fstream>
#include <vector>
#include <sstream>
#include <string>

int main() {
    std::ifstream inputFile("input.txt");
    std::ofstream outputFile("output.txt");

    if (!inputFile.is_open()) {
        std::cerr << "Failed to open input file." << std::endl;
        return 1;
    }
    
    if (!outputFile.is_open()) {
        std::cerr << "Failed to open output file." << std::endl;
        return 1;
    }

    std::string line;
    std::vector<int> numbers;
    int number;
    int sum = 0;

    while (std::getline(inputFile, line)) {
        std::istringstream iss(line);
        while (iss >> number) {
            numbers.push_back(number);
            sum += number;
        }
    }

    outputFile << "Sum: " << sum << std::endl;

    inputFile.close();
    outputFile.close();

    return 0;
}
