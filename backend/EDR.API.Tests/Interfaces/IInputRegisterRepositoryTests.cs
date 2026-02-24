using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Interfaces
{
    public class IInputRegisterRepositoryTests
    {
        [Fact]
        public void IInputRegisterRepository_HasGetAllAsyncMethod()
        {
            // Arrange & Act
            var method = typeof(IInputRegisterRepository).GetMethod("GetAllAsync");

            // Assert
            Assert.NotNull(method);
            Assert.Equal(typeof(Task<IEnumerable<InputRegister>>), method.ReturnType);
            Assert.Empty(method.GetParameters());
        }

        [Fact]
        public void IInputRegisterRepository_HasGetByIdAsyncMethod()
        {
            // Arrange & Act
            var method = typeof(IInputRegisterRepository).GetMethod("GetByIdAsync");

            // Assert
            Assert.NotNull(method);
            Assert.Equal(typeof(Task<InputRegister>), method.ReturnType);
            Assert.Single(method.GetParameters());
            Assert.Equal(typeof(int), method.GetParameters()[0].ParameterType);
        }

        [Fact]
        public void IInputRegisterRepository_HasGetByProjectIdAsyncMethod()
        {
            // Arrange & Act
            var method = typeof(IInputRegisterRepository).GetMethod("GetByProjectIdAsync");

            // Assert
            Assert.NotNull(method);
            Assert.Equal(typeof(Task<IEnumerable<InputRegister>>), method.ReturnType);
            Assert.Single(method.GetParameters());
            Assert.Equal(typeof(int), method.GetParameters()[0].ParameterType);
        }

        [Fact]
        public void IInputRegisterRepository_HasAddAsyncMethod()
        {
            // Arrange & Act
            var method = typeof(IInputRegisterRepository).GetMethod("AddAsync");

            // Assert
            Assert.NotNull(method);
            Assert.Equal(typeof(Task<int>), method.ReturnType);
            Assert.Single(method.GetParameters());
            Assert.Equal(typeof(InputRegister), method.GetParameters()[0].ParameterType);
        }

        [Fact]
        public void IInputRegisterRepository_HasUpdateAsyncMethod()
        {
            // Arrange & Act
            var method = typeof(IInputRegisterRepository).GetMethod("UpdateAsync");

            // Assert
            Assert.NotNull(method);
            Assert.Equal(typeof(Task), method.ReturnType);
            Assert.Single(method.GetParameters());
            Assert.Equal(typeof(InputRegister), method.GetParameters()[0].ParameterType);
        }

        [Fact]
        public void IInputRegisterRepository_HasDeleteAsyncMethod()
        {
            // Arrange & Act
            var method = typeof(IInputRegisterRepository).GetMethod("DeleteAsync");

            // Assert
            Assert.NotNull(method);
            Assert.Equal(typeof(Task), method.ReturnType);
            Assert.Single(method.GetParameters());
            Assert.Equal(typeof(int), method.GetParameters()[0].ParameterType);
        }

        [Fact]
        public void IInputRegisterRepository_HasExistsAsyncMethod()
        {
            // Arrange & Act
            var method = typeof(IInputRegisterRepository).GetMethod("ExistsAsync");

            // Assert
            Assert.NotNull(method);
            Assert.Equal(typeof(Task<bool>), method.ReturnType);
            Assert.Single(method.GetParameters());
            Assert.Equal(typeof(int), method.GetParameters()[0].ParameterType);
        }

        [Fact]
        public void IInputRegisterRepository_HasGetNextIdAsyncMethod()
        {
            // Arrange & Act
            var method = typeof(IInputRegisterRepository).GetMethod("GetNextIdAsync");

            // Assert
            Assert.NotNull(method);
            Assert.Equal(typeof(Task<int>), method.ReturnType);
            Assert.Empty(method.GetParameters());
        }

        [Fact]
        public void IInputRegisterRepository_HasResetIdentitySeedAsyncMethod()
        {
            // Arrange & Act
            var method = typeof(IInputRegisterRepository).GetMethod("ResetIdentitySeedAsync");

            // Assert
            Assert.NotNull(method);
            Assert.Equal(typeof(Task), method.ReturnType);
            Assert.Empty(method.GetParameters());
        }

        [Fact]
        public void IInputRegisterRepository_HasAllRequiredMethods()
        {
            // Arrange
            var expectedMethods = new Dictionary<string, Type>
            {
                { "GetAllAsync", typeof(Task<IEnumerable<InputRegister>>) },
                { "GetByIdAsync", typeof(Task<InputRegister>) },
                { "GetByProjectIdAsync", typeof(Task<IEnumerable<InputRegister>>) },
                { "AddAsync", typeof(Task<int>) },
                { "UpdateAsync", typeof(Task) },
                { "DeleteAsync", typeof(Task) },
                { "ExistsAsync", typeof(Task<bool>) },
                { "GetNextIdAsync", typeof(Task<int>) },
                { "ResetIdentitySeedAsync", typeof(Task) }
            };

            // Act
            var actualMethods = typeof(IInputRegisterRepository).GetMethods()
                .Where(m => !m.IsSpecialName) // Exclude property accessors
                .ToDictionary(m => m.Name, m => m.ReturnType);

            // Assert
            Assert.Equal(expectedMethods.Count, actualMethods.Count);
            
            foreach (var expectedMethod in expectedMethods)
            {
                Assert.True(actualMethods.ContainsKey(expectedMethod.Key), $"Method {expectedMethod.Key} not found");
                Assert.Equal(expectedMethod.Value, actualMethods[expectedMethod.Key]);
            }
        }
    }
}

